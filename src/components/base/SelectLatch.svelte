<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "../Icon.svelte";

    interface SelectValue {
        display: string;
        value: any;
    }

    export let label: string | undefined = undefined;
    export let options: SelectValue[];
    export let currentIndex = -1;
    export let selectionMode: "single" | "multiple" = "single";
    export let currentIndices: number[] = [];
    const defaultText = "Select...";
    let formattedText = defaultText;
    $: {
        if (selectionMode === "single" && currentIndex >= 0) {
            formattedText = options[currentIndex].display;
        } else if (selectionMode === "multiple" && currentIndices.length > 0) {
            formattedText = options
                .filter(
                    (_val, idx, _arr) =>
                        currentIndices.findIndex((x) => x === idx) !== -1
                )
                .map((x) => x.display)
                .join(", ");
        } else {
            formattedText = defaultText;
        }
    }

    let opened = false;
    let selected = []
    let selected1 = false

    let selectElement: HTMLElement;
    let optionsElements: HTMLElement;

    function handleWindowClick(event) {
        if (
            event.target.parentNode != selectElement &&
            event.target.parentNode != optionsElements &&
            opened
        ) {
            opened = false;
        }
    }

    function handleSelection(i: number) {
        if (selectionMode === "multiple") {
            const index = currentIndices.findIndex((x) => x === i);
            if (index === -1) {
                currentIndices = [...currentIndices, i];
                const element = Array.from(document.getElementsByClassName("option-false")).filter(e => e.innerText == options[i].display)[0]
                element.className = element.className.replace("false", "true")
                selected.push(options[i])
            } else {
                currentIndices.splice(index, 1);
                currentIndices = currentIndices;
                const element = Array.from(document.getElementsByClassName("option-true")).filter(e => e.innerText == options[i].display)[0]
                element.className = element?.className?.replace("true", "false")
                selected = selected.filter(s => s !== options[i])
            }
            dispatch("selectionChanged", {
                values: options.filter(
                    (_val, idx, _arr) =>
                        currentIndices.findIndex((x) => x === idx) !== -1
                ),
            });
        } else {
            currentIndex = i;
            dispatch("selectionChanged", {
                newValue: options[i],
            });
        }
    }
    const dispatch = createEventDispatcher();
</script>

<svelte:window on:mousedown={handleWindowClick} />

<div
    class="select"
    class:unlabeled={label == undefined}
    bind:this={selectElement}
>
    {#if label != undefined}
        <span class="input-label">{label}</span>
    {/if}
    <div1 class="select-input-latch" on:mouseup={(e) => {
        if (e.target.tagName !== "DIV1") return
        opened = !opened
    }} >
        {formattedText}
        <Icon name="chevron_down" class="select-chevron" />
        {#if opened}
            <div class="select-options" bind:this={optionsElements}>
                {#each options as option, i}
                    {#await selected.includes(option) ? selected1 = true : selected1 = false, console.log(selected1)}
                    <d></d>
                    {/await}
                    <div class="option-{selected1}" on:mouseup={() => handleSelection(i)}>
                        {option.display}
                    </div>
                    
                {/each}
            </div>
        {/if}
    </div1>
</div>

<style lang="scss">

    ::selection {
        background-color: transparent;
    }

    .select-input-latch {
        background: var(--background-color-brighter);
        padding: 0.8em;
        color: var(--input-text-color);
        border-radius: 0.5em;
        margin: 0.3em 0;
        border: 2px solid var(--input-border);
        font-size: 10pt;
        position: relative;

        :global(.select-chevron) {
            position: absolute;
            width: 20px;
            right: 0.5em;
            color: var(--input-text-color);
        }
    }
    .select-options {
        position: absolute;
        top: 3.15em;
        left: 0;
        background: var(--background-color-brighter);
        z-index: 1;
        border-radius: 0.5em;
        width: 100%;
        max-height: 26em;
        overflow-y: auto;
        margin: 0.3em 0;
        border: 2px solid var(--input-border);

        .option-false {
            width: calc(100% - 1em);
            padding: 1em 0.5em;
            cursor: pointer;

            &:first-child {
                border-top-left-radius: 0.5em;
                border-top-right-radius: 0.5em;
            }

            &:last-child {
                border-bottom-left-radius: 0.5em;
                border-bottom-right-radius: 0.5em;
            }

            &:hover {
                background: rgb(255, 255, 255, 0.05);
            }
        }

        .option-true {
            width: calc(100% - 1em);
            padding: 1em 0.5em;
            cursor: pointer;
            background: var(--primary-color-darker);
            color: var(--text-color);
            border-top: 1px solid var(--input-border);
            border-bottom: 1px solid var(--input-border);

            // &:first-child {
            //     border-top-left-radius: 0.5em;
            //     border-top-right-radius: 0.5em;
            // }

            // &:last-child {
            //     border-bottom-left-radius: 0.5em;
            //     border-bottom-right-radius: 0.5em;
            // }

            &:hover {
                background: var(--primary-color);
            }
        }
    }

    .input-label {
        display: inline-block;
        width: 7em;
    }

    .select:not(.unlabeled) {
        display: grid;
        grid-template-columns: 1fr 8fr;
        gap: 0.5em;
        align-items: center;
    }

    .select.unlabeled {
        display: flex;

        .select-input {
            width: 100%;
        }
    }
</style>