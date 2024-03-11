export let label: string | undefined = undefined;
export let value: string | number;
export let html_input_type: "text" | "password" = "text";
export let input_type: "integer" | "float" | undefined = undefined;
export let name = label;
export let maxlength = -1;

export function handleOutEvent(event) {
    const val = (event.target as HTMLInputElement).value;
    var target_type = event.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("collapsible-header")[0]?.getElementsByClassName("container-header")[0].getElementsByClassName("heading")[0].localName || event.currentTarget.parentNode.parentNode.parentNode.getElementsByClassName("container-header")[0]?.getElementsByClassName("heading")[0]?.localName || event.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("label")[0].localName

    switch (target_type) {
        case "h2":
            target_type = "A Command"
            break
        case "h3":
            target_type = "An Option"
            break
        case "h4":
            target_type = "A Choice"
            break
        case "undefined":
            target_type = "A Localized"
    }

    const target_name = String(event.target.name) || String(target_type)

    switch (target_name) {
        case "Name *": 
            if (target_type !== "A Choice") {
                if (val.match(/([^a-z0-9-_])+/g) || (event.target as HTMLInputElement).value.match(/(^$)/g) ) {
                    showError(event, "error", `${target_type} Name is Required`)
                } else {
                    showError(event)
                }                 
            } else {
                if (val.match(/(^$)/g)) {
                    showError(event, "error", `${target_type} Name is Required`)
                } else if (val.replace(" ", "") == "") {
                    showError(event, "error", `${target_type} Name can not contain only Spaces`)
                } else {
                    showError(event)
                }  
            }

            break;

        case "Description *": 
            if (!val) {
                showError(event, "error", `${target_type} Description is Required`)
            } else if (val.replace(" ", "") == "") {
                showError(event, "error", `${target_type} Description can not contain only Spaces`)
            } else {
                showError(event)
            }                  
            break

        case "GuildID": 
            showError(event, "guildID")
            break


        case "Value *": 
            if (!val) {
                showError(event, "error", `${target_type} Value is Required`)
            } else if (val.replace(" ", "") == "") {
                showError(event, "error", `${target_type} Value can not contain only Spaces`)
            } else {
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

        default:
            console.log(target_name)
            event.target.style.border = "2px solid var(--input-border)"
            break
    }
        
}

export function handleInEvent(event) {
    event.target.style.border = "2px solid var(--primary-color)" 
 
}


export function showError(event, type?: string, message?: string) {
    switch (type) {
        case "error":
            event.target.style.border = "2px solid red"
            event.target.style.borderBottom = "2px dotted red"
            event.target.style.borderBottomLeftRadius = 0
            event.target.style.borderBottomRightRadius = 0
            event.srcElement.nextElementSibling.style.borderTopLeftRadius = 0  
            event.srcElement.nextElementSibling.style.borderTopRightRadius = 0  
            event.srcElement.nextElementSibling.innerHTML = message
            event.srcElement.nextElementSibling.hidden = false            
            break;

        case "guildID":
            event.target.style.border = "2px solid var(--input-border)"
            event.target.style.borderRadius = "0.5em"
            event.srcElement.nextElementSibling.hidden = true             
            break;
    
        default:
            event.target.style.border = "2px solid green"
            event.target.style.borderRadius = "0.5em"
            event.srcElement.nextElementSibling.hidden = true             
            break;
    }

}