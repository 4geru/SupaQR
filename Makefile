.PHONY: add-qr-column add-qr-column-cli

# Supabaseの環境変数を読み込む
include .env

add-qr-column-migration:
	@if [ -z "$(table_name)" ]; then \
		echo "Error: table_name is required. Usage: make add-qr-column-cli table_name=your_table_name"; \
		exit 1; \
	fi
	@migration_file=$$(supabase migration new add_qr_code_number_to_$(table_name) | grep -o 'supabase/migrations/[0-9]*_add_qr_code_number_to_$(table_name).sql'); \
	echo "ALTER TABLE $(table_name) ADD COLUMN qr_code_number UUID DEFAULT gen_random_uuid();" > $$migration_file; \
	echo "UPDATE $(table_name) SET qr_code_number = gen_random_uuid() WHERE qr_code_number IS NULL;" >> $$migration_file; \
	echo "Created migration file: $$migration_file"

