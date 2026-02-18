.PHONY: build run clean debug fe-install fe-dev fe-build fe-preview

GO_DIR=./backend
FE_DIR=./frontend

BINARY_NAME=$(GO_DIR)/i-hate-pdf-with-passwords

# Backend targets
debug-build:
	cd $(GO_DIR) && go build -gcflags="all=-N -l" -o i-hate-pdf-with-passwords .

run: debug-build
	cd $(GO_DIR) && ./i-hate-pdf-with-passwords

clean:
	rm -f $(BINARY_NAME)
	cd $(GO_DIR) && go clean
	rm -rf $(FE_DIR)/dist

# Frontend targets
fe-install:
	cd $(FE_DIR) && pnpm install

fe-dev:
	cd $(FE_DIR) && pnpm run dev

fe-build:
	cd $(FE_DIR) && pnpm run build

fe-preview:
	cd $(FE_DIR) && pnpm run preview