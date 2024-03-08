<script lang="ts">
    export let label: string | undefined = undefined;
    export let value: string | number;
    export let html_input_type: "text" | "password" = "text";
    export let input_type: "integer" | "float" | undefined = undefined;
    export let name = label;
    export let maxlength = -1;
    import { handleInEvent, handleOutEvent, showError } from "../../util/borders"  

    export function handleInput(event) {
        const val = (event.target as HTMLInputElement).value;
        var target_type = event.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("collapsible-header")[0]?.getElementsByClassName("container-header")[0].getElementsByClassName("heading")[0].innerHTML || event.currentTarget.parentNode.parentNode.parentNode.getElementsByClassName("container-header")[0]?.getElementsByClassName("heading")[0]?.innerHTML || event.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("label")[0].innerHTML
    
        switch (target_type) {
            case "Command":
                target_type = "A Command"
                break
            case "Option":
                target_type = "An Option"
                break
            case "Choice":
                target_type = "A Choice"
                break
            case "Localization":
                target_type = "A Localized"
        }
        

        const target_name = String(event.target.name) || String(target_type)

        switch (target_name) {
            case "Name *": 
                if (target_type !== "A Choice") {
                    if (val.match(/(^$)/g) ) {
                        showError(event, "error", `${target_type} Name is Required`)
                    } else if (val.match(/([A-Z])/g)){
                        showError(event, "error", `${target_type} Name can not contain Capital Letters`)
                    } else if (val.match(/([^a-z0-9-_])/g)){
                        showError(event, "error", `${target_type} Name can only contain Letters, Numbers, Underscores and Dashes`)
                    } else {
                        showError(event)
                    }                     
                } else {
                    if (val.match(/(^$)/g) ) {
                        showError(event, "error", `${target_type} Name is Required`)
                    } else if (val.replaceAll(" ", "") == "") {
                        showError(event, "error", `${target_type} Name can not contain only Spaces`)
                    } else {
                        showError(event)
                    }  
                }

                break;

            case "Description *": 
                if (!val) {
                    showError(event, "error", `${target_type} Description is Required`)
                } else if (val.replaceAll(" ", "") == "") {
                    showError(event, "error", `${target_type} Description can not contain only Spaces`)
                } else {
                    showError(event)
                }                  
                break

            case "GuildID": 
                if (!val.match(/([0-9])+/g) && val !== " ") {
                    showError(event, "error", "A Guild ID consists of only Numbers")
                } else {
                    showError(event, "guildID")
                }
                break

            case "Value *": 
                if (!val) {
                    showError(event, "error", `${target_type} Value is Required`)
                } else if (val.replaceAll(" ", "") == "") {
                    showError(event, "error", `${target_type} Value can not contain only Spaces`)
                }else {
                    showError(event)
                }
                break

            case "A Localized":
                if (!val) {
                    showError(event, "error", `${target_type} Translation is Required`)
                }else {
                    showError(event)
                }
                    break
            }

        

        if (input_type === "integer") {
            value = parseInt(val);
        } else if (input_type === "float") {
            value = parseFloat(val);
        } else {
            value = val;
        }

    }


</script>

<div class="input-group" class:unlabeled={label == undefined}>
    {#if label != undefined}
        <label class="input-label" for={name}>{label}</label>
    {/if}
    <div class="input-container">
        <input
            type={html_input_type}
            value={value ? value : ""}
            on:input={handleInput}
            on:focusout={handleOutEvent}
            on:focusin={handleInEvent}
            {name}
            {maxlength}
        />
        <div hidden class="message"></div>
    </div>
</div>

<style lang="scss">

    .input-label::selection {
        background-color: transparent;
    }

    .input-label {
        width: 7em;
    }

    .input-group:not(.unlabeled) {
        display: grid;
        grid-template-columns: 1fr 8fr;
        gap: 0.5em;
        align-items: center;
    }

    .input-group.unlabeled {
        display: grid;

        input {
            width: auto;
        }
    }

    .input-container {
        display: grid;

        input {
            width: auto;
        }
    }

    input {
        background: var(--background-color-brighter);
        padding: 0.8em;
        color: var(--input-text-color);
        border-radius: 0.5em;
        margin: 0.3em 0;
        border: 2px solid var(--input-border);
        width: auto;
        margin-bottom: 0;
        
        &:focus,
        &:focus-visible {
            outline: 0;
            border-color: var(--primary-color);
        }
    }

  

.message {
    background: var(--background-color-brighter);
    text-indent: 0.6em;
    color: var(--input-text-color);
    border-radius: 0.5em;
    border-top-right-radius: 0;
    border-top-left-radius: 0;
    border: 2px solid red;
    border-top: none;
    padding: 0.2em;
    top: 100%;
    font-size: small;
}
</style>
