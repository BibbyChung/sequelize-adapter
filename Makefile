workspace-up:
	docker run -it --rm -v $(PWD):/app -w /app node:10.14-alpine sh