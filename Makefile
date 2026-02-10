.PHONY: build run clean debug

GO_DIR=./backend
BINARY_NAME=$(GO_DIR)/i-hate-pdf-with-passwords

debug-build:
	cd $(GO_DIR) && go build -gcflags="all=-N -l" -o i-hate-pdf-with-passwords .

run: debug-build
	cd $(GO_DIR) && ./i-hate-pdf-with-passwords

clean:
	rm -f $(BINARY_NAME)
	cd $(GO_DIR) && go clean