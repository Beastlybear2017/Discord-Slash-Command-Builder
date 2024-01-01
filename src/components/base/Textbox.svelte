<script lang="ts">
    export let label: string | undefined = undefined;
    export let value: string | number;
    export let html_input_type: "text" | "password" = "text";
    export let input_type: "integer" | "float" | undefined = undefined;
    export let name = label;
    export let maxlength = -1;

    function handleInput(event) {
        const val = (event.target as HTMLInputElement).value;

        switch (String(event.target.name)) {
            case "Name *": 
                if ((event.target as HTMLInputElement).value.match(/([^a-z0-9-_])+/g) || (event.target as HTMLInputElement).value.match(/(^$)/g) ) {
                    event.target.style.border = "2px solid red"
                } else {
                    event.target.style.border = "2px solid green"
                } 
                break;

            case "Description *": 
                if (!(event.target as HTMLInputElement).value) {
                    event.target.style.border = "2px solid red"
                } else {
                    event.target.style.border = "2px solid green"
                }                  
                break

            case "GuildID": 
                if (!(event.target as HTMLInputElement).value.match(/([0-9])+/g)) {
                    event.target.style.border = "2px solid red"
                } else {
                    event.target.style.border = "2px solid var(--input-border)"
                }
                break

        
            case "Name  *": 
                if ((event.target as HTMLInputElement).value) {
                    event.target.style.border = "2px solid green"
                }else {
                    event.target.style.border = "2px solid red"
                }
                break


            case "value  *": 
                if ((event.target as HTMLInputElement).value) {
                    event.target.style.border = "2px solid green"
                }else {
                    event.target.style.border = "2px solid red"
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

    function handleOutEvent(event) {
        switch (String(event.target.name)) {
            case "Name *": 
                if ((event.target as HTMLInputElement).value.match(/([^a-z0-9-_])+/g) || (event.target as HTMLInputElement).value.match(/(^$)/g) ) {
                    event.target.style.border = "2px solid red"
                } else {
                    event.target.style.border = "2px solid green"
                } 
                break;

            case "Description *": 
                if (!(event.target as HTMLInputElement).value) {
                    event.target.style.border = "2px solid red"
                } else {
                    event.target.style.border = "2px solid green"
                }                  
                break

            case "GuildID": 
                event.target.style.border = "2px solid var(--input-border)"
                break

        
            case "Name  *": 
                if ((event.target as HTMLInputElement).value) {
                    event.target.style.border = "2px solid green"
                }else {
                    event.target.style.border = "2px solid red"
                }
                break

    
            case "Value  *": 
                console.log((event.target as HTMLInputElement).value)
                if ((event.target as HTMLInputElement).value) {
                    event.target.style.border = "2px solid green"
                }else {
                    event.target.style.border = "2px solid red"
                }
                break

            
            default:
                event.target.style.border = "2px solid var(--input-border)"
            }
            
    }

    function handleInEvent(event) {
           event.target.style.border = "2px solid var(--primary-color)" 
        
    }
		
    const onKeyPress = e => {
        if (e.target.name !== "GuildID") return
        if (!isFinite(e.key)){
        }
    };	
        
    

</script>

<div class="input-group" class:unlabeled={label == undefined}>
    {#if label != undefined}
        <label class="input-label" for={name}>{label}</label>
    {/if}
    <input
        type={html_input_type}
        value={value ? value : ""}
        on:input={handleInput}
        on:focusout={handleOutEvent}
        on:focusin={handleInEvent}
        on:keypress={onKeyPress}
        {name}
        {maxlength}
    />
</div>

<style lang="scss">

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

    input {
        background: var(--background-color-brighter);
        padding: 0.8em;
        color: var(--input-text-color);
        border-radius: 0.5em;
        margin: 0.3em 0;
        border: 2px solid var(--input-border);
        width: auto;
        
        &:focus,
        &:focus-visible {
            outline: 0;
            border-color: var(--primary-color);
        }
    }
</style>
