
<script lang="ts">
    import { Highlight } from "svelte-highlight";
    import type { ApplicationCommand } from "../models/app_command";
    import Command from "./Command.svelte";
    import Icon from "./Icon.svelte";
    import json from "svelte-highlight/languages/json";
    import { toasts, ToastContainer, FlatToast, BootstrapToast }  from "svelte-toasts";
    // import commands from "./Command.svelte"
    
    let commands: Partial<ApplicationCommand>[] = [];

    function removeCommand(index: number) {
        commands.splice(index, 1);
        commands = commands;
    }

    var command_json
    
    function createCommand() {
        commands = [...commands, { name: "", description: "", dm_permission: false }];
        command_json = JSON.stringify(commands, null, 2)
    }

    function updateCommands() {
        command_json = JSON.stringify(commands, null, 2).split("\n").map(line => line.replace(/^ {2}/, "")).slice(1).filter(l => l.trim() !== "")
        command_json.pop()
        command_json = command_json.join("\n")
    }

    async function copyJSONToClipboard() { 

        navigator.clipboard.writeText(removeFalsy(command_json, true));

        const toast = toasts.add({
            title: 'Copied',
            description: '',
            duration: 1500, // 0 or negative to avoid auto-remove
            placement: 'bottom-center',
            theme: 'dark',
            type: 'success',
            onClick: () => {},
            onRemove: () => {},
            // component: BootstrapToast, // allows to override toast component/template per toast
        });
    }

    function removeFalsy(object: Object, copy?: boolean) {
        if (typeof object == "string") {
            object = JSON.parse(object)
        }

        Object
        .entries(object)
        .forEach(([k, v]) => {
            if (v && typeof v === 'object' && copy) {
                removeFalsy(v, true);
            }
            if (v && typeof v === 'object' && !Object.keys(v).length || v === false && (k !== "dm_permission") || v === "" && k != "name" && k != "description" && k != "value" || v.name == "" && v.value == "" && copy) {
                // console.log(`${v.name} | ${v.value}`)
                if (v[k] === "") {
                    delete object[k]
                    return
                }
                if (Array.isArray(object)) {
                    object.splice(Number(k), 1);
                } else {
                    delete object[k];
                }
                // object[dm_permission] = dm_perms
            }
        });
        return JSON.stringify(object, null, 4)
    };
</script>

<div class="command-list-container" on:keyup={() => updateCommands()} on:mouseup={async () => {await new Promise(f => setTimeout(f, 10)); updateCommands()}}>
    <div class="command-list">
        {#each commands as command, i}
            <Command on:remove={() => {removeCommand(i)}} bind:command  />
        {/each}
    </div>
    <div class="button-bar">
        <button on:click={createCommand}>
            <Icon name="add" class="btn-icon" />
            Add Command
        </button>
    </div>
    <br>
    <br>
    {#if commands[0]}
        <div class="output-json-container">
            <Highlight language={json} code={command_json} />
            <button class="copy-button" on:click={copyJSONToClipboard} >
                <Icon name="copy" class="btn-icon" />Copy
            </button>
        </div>
    {/if}
    <ToastContainer let:data={data}>
        <FlatToast {data} />
    </ToastContainer>
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

    .output-json-container {
        position: relative;
    }

    /* .copy-button {
        position: absolute;
        top: 1em;
        right: 1em;
    } */
</style>