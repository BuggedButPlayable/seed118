import type { Command } from '../types/commands';

/**
 * Collects commands from UI/input between ticks and hands them to SimWorld.tick() in FIFO order.
 */
export class SimCommandQueue {
    private pendingCommands: Command[] = [];

    /** Adds a command for the next tick. */
    public enqueueCommand(command: Command): void {
        this.pendingCommands.push(command);
    }

    /** Returns all pending commands in enqueue order and empties the queue. */
    public drainCommands(): Command[] {
        const drained = this.pendingCommands;
        this.pendingCommands = [];
        return drained;
    }

    public getCommandsCount(): number {
        return this.pendingCommands.length;
    }
}
