<script lang="ts">
	import CommandList from "./components/CommandList.svelte";
</script>

<main>
	<h1>Slash Command Builder</h1>
	<h3>* Are Required Fields</h3>
	<CommandList />
</main>

<style lang="scss">
	h1 {
		text-align: center;
	}

	h3 {
		text-align: center;
		font-size: medium;
	}
</style>
