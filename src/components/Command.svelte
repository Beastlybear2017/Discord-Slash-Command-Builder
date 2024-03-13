<script lang="ts" context="module">
  
</script>
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Highlight from "svelte-highlight";
    import json from "svelte-highlight/languages/json";
    import atomOneDark from "svelte-highlight/styles/atom-one-dark";
    import {
        ApplicationCommand,
        ApplicationCommandType,
        Permissions
    } from "../models/app_command";
    import { buildOptionsFromEnum } from "../util/enum_util";
    import Checkbox from "./base/Checkbox.svelte";
    import Collapsible from "./base/Collapsible.svelte";
    import Select from "./base/Select.svelte";
    import SelectLatch from "./base/SelectLatch.svelte";
    import Textbox from "./base/Textbox.svelte";
    import CommandOption from "./CommandOption.svelte";
    import Icon from "./Icon.svelte";
    import Localization from "./Localization.svelte";
    
    // import { toasts, ToastContainer, FlatToast, BootstrapToast }  from "svelte-toasts";


    export let command: Partial<ApplicationCommand>;  
    $: command_json = JSON.stringify(removeFalsy(command) , null, 4)


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
            if (v && typeof v === 'object' && !Object.keys(v).length || v === false && (k !== "dm_permission") || v === "" && k != "name" && k != "description" && k != "value" || v?.name == "" && v?.value == "" && copy || k == "type" && v == "1") {
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
        return object
    };



    const dispatch = createEventDispatcher();

    function addOption() {
        if (!command.options) {
            command.options = [];
        }
        command.options = [...command.options, { name: "", description: "" }];
    }

    let commandTypes = buildOptionsFromEnum(ApplicationCommandType);

    let defaultCommandType = 0;
    $: command.type = commandTypes[defaultCommandType].value;

    let permissions = buildOptionsFromEnum(Permissions, true);

    function setPermissions(permissions) {
        command.defaultMemberPermissions = permissions.map((p) => p.value)
    }

    command.guild_id = command.guild_id 
    $: command.guild_id = (command?.guild_id?.replace(/[^0-9]/g, '')) || ""

    command.name = command.name 
    $: if (!command.hasOwnProperty("type")) {command.name = command.name.toLocaleLowerCase().replace(" ", "-").replace(/[^a-z0-9-_]/g, '')} else {command.name = command.name}
    

    command.dm_permission = command.dm_permission
    $: command.dm_permission = command.dm_permission || false
    
    let advanced = Boolean("")
    $: advanced = advanced || false

    async function deleteDescription() {
        return new Promise(resolve => {
        setTimeout(() => {
            delete command.description;
            resolve();
        }, 1);
        });
    }
</script>



<svelte:head>
    {@html atomOneDark}
</svelte:head>

<div class="command-container">
    <Collapsible>
        <div class="container-header" slot="header">
            <h2 class="heading">/ {command.name || "command"}<h>{"   "}
                {#if command?.options?.[0]}
                    {#each command?.options as option}
                        {#if option.required}
                            <h> </h>
                            <required>{option.name}</required>
                        {/if}
                        
                    {/each}
                    {#if ((command?.options?.map(o => o).filter(r => !r.required && r.name)).toString() != "")}
                        <optional-text> | Optional</optional-text>
                    {/if}
                    {#each command?.options as option}
                        {#if !option.required}
                            <h> </h>
                            <optional>{option.name}</optional>
                        {/if}
                    {/each}
                {/if}
                
            
            <div
                class="delete-icon-wrapper"
                on:click={() => dispatch("remove")}
                on:keyup={() => {}}
            >
                <Icon name="delete" class="delete-icon" />
            </div>   
        </div>
        <div class="content" slot="content">
            <Checkbox
                label="Advanced Options"
                bind:value={advanced}
            />
            <!-- {#if advanced}
                <Textbox label="GuildID" bind:value={command.guild_id} />
            {/if} -->
            <Textbox label="Name *" bind:value={command.name} maxlength={32} />
            {#if advanced}
                <Localization bind:localizations={command.name_localizations} />
            {/if}
            {#if (command.type !== 2) && (command.type !== 3)} 
                {#if !command.hasOwnProperty("description")}
                    {#await command.description = ""}<h></h>{/await} 
                {/if}               
                <Textbox
                    label="Description *"
                    bind:value={command.description}
                    maxlength={100}
                />
            {:else}
                {#if command.hasOwnProperty("description")}
                    {#await delete command.description}<h></h>{/await} 
                {/if}

            {/if}
            {#if advanced}
                <Localization
                    bind:localizations={command.description_localizations}
                />
            {/if}
            <Select
                label="Type"
                options={commandTypes}
                bind:currentIndex={defaultCommandType}
            />
            {#if advanced}
                <SelectLatch
                    label="Permissions"
                    options={permissions}
                    selectionMode="multiple"
                    on:selectionChanged={(event) =>
                        setPermissions(event.detail.values)}
                />
                {#if !command.guild_id}
                    <Checkbox
                        label="DM Permission"
                        bind:value={command.dm_permission}
                    />
                {/if}
            {/if}
            {#if (command.type !== 2) && (command.type !== 3)}
                <div class="command-options">
                    {#if command.options}
                        {#each command.options as option, i}
                            <CommandOption
                                bind:option
                                on:remove={() => {
                                    command.options.splice(i, 1);
                                    if (command.options.length === 0) {
                                        command.options = undefined;
                                    } else {
                                        command.options = command.options;
                                    }                
                                }}
                            />
                        {/each}
                    {/if}
                </div>
                <div class="button-bar" id="add-command-button">
                    <button on:click={addOption}>
                        <Icon name="add" class="btn-icon" />Add Option
                    </button>
                </div>
            {:else}
                {#if command.hasOwnProperty("options")}
                    {#await delete command.options}<h></h>{/await} 
                {/if}  
            {/if}
            <!-- <div class="output-json-container">
                <Highlight language={json} code={command_json} />
                <button class="copy-button" on:click={copyJSONToClipboard}>
                    <Icon name="copy" class="btn-icon" />Copy
                </button>
            </div> -->
        </div>
    </Collapsible>
</div>

<style lang="scss">
    .command-container {
        box-shadow: 0px 0px 10px 3px var(--box-shadow);
        border-radius: 0.5em;
        margin-bottom: 1em;

        .container-header {
            width: 100%;
            height: 3em;        
            

        }

        .content {
            padding: 1em;
        }
    }        
    
    required:not(:empty){
        font-size: medium;
        background-color: #5865f2;
        border-radius: 0.2em;
        padding: 0.1em 0.5em;
    }

    optional:not(:empty){
        font-size: medium;
        background-color: #4b4c4d;
        border-radius: 0.2em;
        padding: 0.1em 0.5em;
    }

    optional-text {
        color: #4b4c4d;
    }

    .command-options {
        margin: 1em;
    }

    // .output-json-container {
    //     position: relative;
    // }

    // .copy-button {
    //     position: absolute;
    //     top: 1em;
    //     right: 1em;
    // }

    ::selection {
        background-color: transparent;
    }
</style>
