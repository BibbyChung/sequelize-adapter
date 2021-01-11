workspace-up:
	docker run -it --rm -v $(PWD):/app:cached -w /app node:12.18 bash
	# docker run -it --rm -v $(PWD):/app -w /app node:12.18-alpine sh