<script lang="ts">
	import CommandList from "./components/CommandList.svelte";
</script>

<main >
	<centered>
		<h1>Slash Command Builder</h1>
		<h3>* Are Required Fields</h3>
	</centered>
	<CommandList />
</main>

<style lang="scss">

	::selection {
		background-color: transparent;
	}

	h3 {
		font-size: medium;
	}

	centered {
		text-align: center;

	}

</style>
