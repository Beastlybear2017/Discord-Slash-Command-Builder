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

    // async function copyJSONToClipboard() {
    //     let commandJson
    //     try {
    //       commandJson =  removeFalsy(command_json, true) 
    //     } catch (error) {
    //         console.log(error)
    //         return            
    //     }
    //     navigator.clipboard.writeText(JSON.stringify(commandJson, null, 4));

    //     const toast = toasts.add({
    //         title: 'Copied',
    //         description: 'The Commands have been copied to your clipboard :)',
    //         duration: 3000, // 0 or negative to avoid auto-remove
    //         placement: 'top-center',
    //         theme: 'dark',
    //         type: 'success',
    //         onClick: () => {},
    //         onRemove: () => {},
    //         // component: BootstrapToast, // allows to override toast component/template per toast
    //     });
    // }

    let commandTypes = buildOptionsFromEnum(ApplicationCommandType);

    let defaultCommandType = 0;
    $: command.type = commandTypes[defaultCommandType].value;

    let permissions = buildOptionsFromEnum(Permissions, true);

    function setPermissions(permissions) {
        console.log(permissions)
        command.defaultMemberPermissions = permissions.map((p) => p.value)
        ;
    }

    command.guild_id = command.guild_id 
    $: command.guild_id = (command?.guild_id?.replace(/[^0-9]/g, '')) || ""

    command.name = command.name 
    $: command.name = command.name.toLocaleLowerCase().replace(/[^a-z0-9-_]/g, '')
    

    command.dm_permission = command.dm_permission
    $: command.dm_permission = command.dm_permission || false
    
    let advanced = Boolean("")
    $: advanced = advanced || false

</script>



<svelte:head>
    {@html atomOneDark}
</svelte:head>

<div class="command-container">
    <Collapsible>
        <div class="container-header" slot="header">
            <h2 class="heading">Command</h2>
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
            {#if advanced}
                <Textbox label="GuildID" bind:value={command.guild_id} />
            {/if}
            <Textbox label="Name *" bind:value={command.name} maxlength={32} />
            {#if advanced}
                <Localization bind:localizations={command.name_localizations} />
            {/if}
            <Textbox
                label="Description *"
                bind:value={command.description}
                maxlength={100}
            />
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
                <Select
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
        }

        .content {
            padding: 1em;
        }


    }

    .command-options {
        margin: 1em 0;
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
