<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import {
        ApplicationCommandOption,
        ApplicationCommandOptionType,
        ChannelType,
    } from "../models/app_command";
    import { buildOptionsFromEnum } from "../util/enum_util";
    import Checkbox from "./base/Checkbox.svelte";
    import Collapsible from "./base/Collapsible.svelte";
    import Select from "./base/Select.svelte";
    import Textbox from "./base/Textbox.svelte";
    import CommandOptionChoice from "./CommandOptionChoice.svelte";
    import Icon from "./Icon.svelte";
    import Localization from "./Localization.svelte";

    export let option: Partial<ApplicationCommandOption>;
    $: option_json = JSON.stringify(removeFalsy(option) , null, 4)


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
            if (v && typeof v === 'object' && !Object.keys(v).length || v === "" && k != "name" && k != "description" && k != "value" || v?.name == "" && v?.value == "" && copy || v == null) {
                if (Array.isArray(object)) {
                    object.splice(Number(k), 1);
                } else {
                    delete object[k];
                }
            }
        });
        return object
    };

    const dispatch = createEventDispatcher();

    function addOption() {
        if (!option.options) {
            option.options = [];
        }
        option.options = [...option.options, { name: "", description: "" }];
    }

    function addOptionChoice() {
        if (!option.choices) {
            option.choices = [];
        }
        option.choices = [...option.choices, { name: "", value: "" }];
    }

    function cleanUpOption(opt: Partial<ApplicationCommandOption>) {
        if (
            opt.options != undefined &&
            opt.type !== ApplicationCommandOptionType.SUB_COMMAND &&
            opt.type !== ApplicationCommandOptionType.SUB_COMMAND_GROUP
        ) {
            opt.options = undefined;
        }
        if (
            (opt.max_value != undefined || option.min_value != undefined) &&
            opt.type !== ApplicationCommandOptionType.INTEGER &&
            opt.type !== ApplicationCommandOptionType.NUMBER
        ) {
            opt.max_value = undefined;
            opt.min_value = undefined;
        }
        if (
            opt.autocomplete != undefined &&
            ((opt.type !== ApplicationCommandOptionType.NUMBER &&
                opt.type !== ApplicationCommandOptionType.INTEGER &&
                opt.type !== ApplicationCommandOptionType.STRING) ||
                (opt.choices != undefined && opt.choices.length > 0))
        ) {
            opt.autocomplete = undefined;
        }
        if (
            opt.choices != undefined &&
            opt.type !== ApplicationCommandOptionType.NUMBER &&
            opt.type !== ApplicationCommandOptionType.INTEGER &&
            opt.type !== ApplicationCommandOptionType.STRING
        ) {
            opt.choices = undefined;
        }
        if (
            opt.channel_types != undefined &&
            opt.type !== ApplicationCommandOptionType.CHANNEL
        ) {
            opt.channel_types = undefined;
        }
    }

    let commandOptionTypes = buildOptionsFromEnum(ApplicationCommandOptionType);

    let channelTypes = buildOptionsFromEnum(ChannelType);

    let defaultOptionType = 2;
    $: option.type = commandOptionTypes[defaultOptionType].value;
    $: cleanUpOption(option);

    function handleChannelTypeSelectionChanged(event) {
        option.channel_types = event.detail.values.map((x) => x.value);
    }

    option.required = true
    option.max_value = null
    option.max_value = null

    option.name = option.name || ""
    $: option.name = option?.name?.toLocaleLowerCase().replace(" ", "-").replace(/[^a-z0-9-_]/g, '')

    let advanced = Boolean("")
    $: advanced = advanced || false

    option.min_value = option.min_value
    $: option.min_value = Number(String(option.min_value).replace(/[^0-9]/g, "")) || null

    option.max_value = option.max_value
    $: option.max_value = Number(String(option.max_value).replace(/[^0-9]/g, "")) || null
</script>

<div class="command-option-container">
    <Collapsible>
        <div class="container-header" slot="header">
            <h3 class="heading">{option.name || "Option"}</h3>
            <div
                class="delete-icon-wrapper"
                on:click={() => dispatch("remove")}
                on:keyup={() => {}}
            >
                <Icon name="delete" class="delete-icon" />
            </div>
        </div>
  
        <div class="content" slot="content">

            <div class="command-option-info">
                <Checkbox
                    label="Advanced Options"
                    bind:value={advanced}
                />      
                <Textbox label="Name *" bind:value={option.name} maxlength={32} />
                {#if advanced}
                <Localization bind:localizations={option.name_localizations} />
                {/if}
                <Textbox
                    label="Description *"
                    bind:value={option.description}
                    maxlength={100}
                />
                {#if advanced}
                <Localization bind:localizations={option.description_localizations} />
                {/if}
                <Checkbox label="Required" bind:value={option.required} />
                <Select
                    label="Type"
                    options={commandOptionTypes}
                    bind:currentIndex={defaultOptionType}
                />
            </div>
            {#if option.type === ApplicationCommandOptionType.SUB_COMMAND || option.type === ApplicationCommandOptionType.SUB_COMMAND_GROUP}
                {#if option.options}
                    {#each option.options as child_option, i}
                        <svelte:self
                            option={child_option}
                            on:remove={() => {
                                option.options.splice(i, 1);
                                if (option.options.length === 0) {
                                    option.options = undefined;
                                } else {
                                    option.options = option.options;
                                }  
                            }}
                        />
                    {/each}
                {/if}
                <div class="button-bar">
                    <button on:click={addOption}>
                        <Icon name="add" class="btn-icon" />Add Option
                    </button>
                </div>
            {/if}
            {#if option.type === ApplicationCommandOptionType.CHANNEL}
                <Select
                    label="Channel Type"
                    options={channelTypes}
                    selectionMode="multiple"
                    on:selectionChanged={handleChannelTypeSelectionChanged}
                />
            {/if}
            {#if option.type === ApplicationCommandOptionType.NUMBER || option.type === ApplicationCommandOptionType.INTEGER}
                <Textbox
                    label="Min Value"
                    input_type={option.type ===
                    ApplicationCommandOptionType.NUMBER
                        ? "integer"
                        : "float"}
                    bind:value={option.min_value}
                />
                <Textbox
                    label="Max Value"
                    input_type={option.type ===
                    ApplicationCommandOptionType.NUMBER
                        ? "integer"
                        : "float"}
                    bind:value={option.max_value}
                />
            {/if}
            {#if option.type === ApplicationCommandOptionType.NUMBER || option.type === ApplicationCommandOptionType.INTEGER || option.type === ApplicationCommandOptionType.STRING}

                {#if option.choices}
                    <div class="option-choice-list">
                        {#each option.choices as choice, i}
                            <CommandOptionChoice
                                bind:choice
                                bind:optionType={option.type}
                                on:remove={() => {
                                    option.choices.splice(i, 1);
                                    if (option.choices.length === 0) {
                                        option.choices = undefined;
                                    } else {
                                        option.choices = option.choices;
                                    }
                                }}
                            />
                        {/each}
                    </div>
                {/if}                
                {#if option.choices == undefined || option.choices.length == 0}
                    {#if advanced}
                    <Checkbox
                        label="Autocomplete"
                        bind:value={option.autocomplete}
                    />
                    {/if}
                {/if}
                <div class="button-bar">
                    <button on:click={addOptionChoice}>
                        <Icon name="add" class="btn-icon" />Add Option Choice
                    </button>
                </div>
            {/if}
        </div>
    </Collapsible>
</div>

<style lang="scss">
    .command-option-container {
        box-shadow: 0px 0px 5px 0px var(--box-shadow);
        border-radius: 0.5em;
        margin-bottom: 1em;

        .container-header {
            width: 100%;
        }
        .content {
            padding: 1em;
        }
    }

    .option-choice-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        margin: 1em 0;
        gap: 1em;
    }
</style>
