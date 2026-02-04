import { Command } from "../types/commands";

/**
 * A queue for managing simulation commands to be processed in the game.
 */
export class SimCommandQueue {
    private pendingCommands: Array<Command> = [];
    private drainingCommands: Array<Command> = [];
    private lastCommand: Command | null = null;

    /**
     * Enqueue a command to be processed in the next simulation tick.
     * @param command The command to enqueue.
     * @returns void
     */
    public enqueueCommand(command: Command | null): void {
        if (command == null)
            return;

        this.pendingCommands.push(command);
        this.lastCommand = command;
    }

    /**
     * Drain all pending commands for processing.
     * @returns An array of commands that were pending.
     */
    public drainCommands(): Array<Command> {
        this.drainingCommands = this.pendingCommands;
        this.pendingCommands = [];
        return this.drainingCommands;
    }

    /**
     * Get the count of pending commands.
     * @returns The number of pending commands.
     */
    public getCommandsCount(): number {
        return this.pendingCommands.length;
    }

    /**
     * Get the last enqueued command.
     * @returns The last command or null if none exist.
     */
    public getLastCommand(): Command | null {
        return this.lastCommand;
    }
}