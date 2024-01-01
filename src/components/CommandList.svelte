<script lang="ts">
    import type { ApplicationCommand } from "../models/app_command";
    import Command from "./Command.svelte";
    import Icon from "./Icon.svelte";

    let commands: Partial<ApplicationCommand>[] = [];

    function createCommand() {
        commands = [...commands, { name: "", description: "" }];
    }

    function removeCommand(index: number) {
        commands.splice(index, 1);
        commands = commands;
    }
</script>

<div class="command-list-container">
    <div class="command-list">
        {#each commands as command, i}
            <Command bind:command on:remove={() => removeCommand(i)} />
        {/each}
    </div>
    <div class="button-bar">
        <button on:click={createCommand}>
            <Icon name="add" class="btn-icon" />
            Add Command
        </button>
    </div>
</div>

<style>

    .command-list-container {
        max-height: 50em;
    }

    button {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
</style>