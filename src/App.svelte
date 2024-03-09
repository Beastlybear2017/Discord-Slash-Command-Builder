<script lang="ts">
	import CommandList from "./components/CommandList.svelte";

	function updateIframe() {
		const height = document.getElementsByClassName("command-list-container")[0].scrollHeight + 230
		window.parent.postMessage({'msg': height + "px"}, "*")
	}
</script>

<main 
	on:mousemove={() => {updateIframe()}}
	on:keypress={async () => {await new Promise(f => setTimeout(f, 10)); updateIframe()}}
	on:mouseup={async () => {await new Promise(f => setTimeout(f, 10)); updateIframe()}}
	on:load={() => {updateIframe()}}
	>
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
