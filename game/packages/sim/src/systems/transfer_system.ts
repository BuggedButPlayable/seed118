import { getItemDefinitionById } from '../defs/item_registry';
import { getStructureDefinitionById } from '../defs/structure_registry';
import type { GridModel } from '../grid/grid_model';
import { computeWorldPorts, isSameCoord, neighbourAcross, oppositeSide } from '../grid/grid_math';
import type { WorldState } from '../state/world_state';
import { EventType } from '../types/events';
import type { Event } from '../types/events';
import type { DefId, StructureId } from '../types/ids';
import type { ItemKey } from '../types/item';
import type { StructureDefinition, StructurePort, StructureRecord } from '../types/structure';

interface TransferContext {
    state: WorldState;
    grid: GridModel;
    outEvents: Event[];
    /** Structures that already had their turn this tick. */
    visited: Set<StructureId>;
}

/** A structure that may take the sender's item: into its slot (given room) or straight in (delivery). */
type Receiver =
    { kind: 'slot'; id: StructureId; transitTicks: number } | { kind: 'deliver'; id: StructureId };

interface ChainLink {
    senderId: StructureId;
    receivers: Receiver[];
}

/**
 * Moves ready items from output ports to the input port on the other side of the same tile edge
 * (architecture §5.1). Only the receiver decides whether it takes an item (architecture §5.2).
 *
 * Senders take turns in ascending id. If a sender is blocked by a receiver that is itself ready to
 * pass its item on, the receiver moves first. That way full belts advance without gaps, no matter in
 * which order they were built. Every structure moves at most one item per tick (architecture §5.3).
 */
export class TransferSystem {
    public tick(state: WorldState, grid: GridModel, outEvents: Event[]): void {
        const context: TransferContext = { state, grid, outEvents, visited: new Set() };
        for (const [senderId] of state.itemSlots.entries()) {
            this.pushChain(context, senderId);
        }
    }

    private pushChain(context: TransferContext, startId: StructureId): void {
        const chain = this.collectBlockedChain(context, startId);
        // Downstream first, so each move frees the slot the next one needs.
        chain.reverse();
        for (const link of chain) {
            this.moveItem(context, link);
        }
    }

    /** Follows blocked receivers downstream: [sender, its blocking receiver, that one's blocker, ...]. */
    private collectBlockedChain(context: TransferContext, startId: StructureId): ChainLink[] {
        const chain: ChainLink[] = [];
        let currentId: StructureId | null = startId;
        while (currentId !== null && this.isReadyToSend(context, currentId)) {
            context.visited.add(currentId);
            const receivers = this.findReceivers(context, currentId);
            chain.push({ senderId: currentId, receivers });
            currentId = this.findBlockingReceiver(context, receivers);
        }
        return chain;
    }

    private isReadyToSend(context: TransferContext, structureId: StructureId): boolean {
        const slot = context.state.itemSlots.get(structureId);
        return slot?.ticksRemaining === 0 && !context.visited.has(structureId);
    }

    /** The receiver to move first, or null if one already has room or there is none at all. */
    private findBlockingReceiver(
        context: TransferContext,
        receivers: readonly Receiver[],
    ): StructureId | null {
        if (receivers.some((receiver) => this.hasRoom(context, receiver))) {
            return null;
        }
        return receivers[0]?.id ?? null;
    }

    private moveItem(context: TransferContext, link: ChainLink): void {
        const slot = context.state.itemSlots.get(link.senderId);
        const receiver = link.receivers.find((candidate) => this.hasRoom(context, candidate));
        if (!slot || !receiver) {
            return;
        }
        context.state.itemSlots.delete(link.senderId);
        if (receiver.kind === 'deliver') {
            this.deliver(context, receiver.id, slot.itemId);
            return;
        }
        context.state.itemSlots.set(receiver.id, {
            itemId: slot.itemId,
            ticksRemaining: receiver.transitTicks,
        });
    }

    private deliver(context: TransferContext, structureId: StructureId, itemId: DefId): void {
        const total = (context.state.deliveredCounts.get(itemId) ?? 0) + 1;
        context.state.deliveredCounts.set(itemId, total);
        context.outEvents.push({
            type: EventType.Delivered,
            structureId,
            itemKey: getItemDefinitionById(itemId).key,
            total,
        });
    }

    private hasRoom(context: TransferContext, receiver: Receiver): boolean {
        return receiver.kind === 'deliver' || !context.state.itemSlots.has(receiver.id);
    }

    /** Receivers connected to the sender's output ports that accept its item, in port order. */
    private findReceivers(context: TransferContext, senderId: StructureId): Receiver[] {
        const sender = context.state.structureStore.getStructureById(senderId);
        const slot = context.state.itemSlots.get(senderId);
        if (!sender || !slot) {
            return [];
        }
        const itemKey = getItemDefinitionById(slot.itemId).key;
        return portsOf(sender, getStructureDefinitionById(sender.definitionId))
            .filter((port) => port.type === 'output')
            .map((port) => this.findAcceptingReceiver(context, port, itemKey))
            .filter((receiver) => receiver !== null);
    }

    private findAcceptingReceiver(
        context: TransferContext,
        outputPort: StructurePort,
        itemKey: ItemKey,
    ): Receiver | null {
        const tile = neighbourAcross(outputPort.tile, outputPort.side);
        const record = context.state.structureStore.getStructureById(context.grid.getStructureIdAt(tile));
        if (!record) {
            return null;
        }
        const definition = getStructureDefinitionById(record.definitionId);
        const side = oppositeSide(outputPort.side);
        const hasAcceptingInput = portsOf(record, definition).some(
            (port) =>
                port.type === 'input' &&
                port.side === side &&
                isSameCoord(port.tile, tile) &&
                acceptsItem(port, itemKey),
        );
        return hasAcceptingInput ? receiverOf(record.id, definition) : null;
    }
}

/** How a structure takes items, read from its definition; null if it takes none. */
function receiverOf(id: StructureId, definition: StructureDefinition): Receiver | null {
    if (definition.intake === 'deliver') {
        return { kind: 'deliver', id };
    }
    if (definition.transport) {
        return { kind: 'slot', id, transitTicks: definition.transport.transitTicks };
    }
    return null;
}

function portsOf(structure: StructureRecord, definition: StructureDefinition): StructurePort[] {
    return computeWorldPorts(structure.position, structure.rotation, definition.ports);
}

function acceptsItem(port: StructurePort, itemKey: ItemKey): boolean {
    return port.accepts === undefined || port.accepts.includes(itemKey);
}
