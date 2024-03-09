<script lang="ts">
    export let label: string;
    export let value: boolean | undefined;
    export let name = label;
</script>

<div class="checkbox">
    <label for={name} class="input-label">{label}</label>
    <input type="checkbox" bind:checked={value} {name} />
</div>

<style>
    ::selection {
        background-color: transparent;
    }

    .input-label {
        display: inline-block;
    }
</style>