workspace-up:
	docker run -it --rm -v $(PWD):/app -w /app node:10.16-alpine sh