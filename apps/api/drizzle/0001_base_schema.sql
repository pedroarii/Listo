CREATE TYPE "public"."base_unit" AS ENUM('g', 'ml', 'un');--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" text NOT NULL,
	"section_id" uuid NOT NULL,
	"base_unit" "base_unit" NOT NULL,
	"package_size" integer NOT NULL,
	"package_name" text NOT NULL,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_name_not_blank" CHECK (btrim("products"."name") <> ''),
	CONSTRAINT "products_package_name_not_blank" CHECK (btrim("products"."package_name") <> ''),
	CONSTRAINT "products_package_size_positive" CHECK ("products"."package_size" > 0)
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sections_name_not_blank" CHECK (btrim("sections"."name") <> ''),
	CONSTRAINT "sections_order_non_negative" CHECK ("sections"."order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_section_id_idx" ON "products" USING btree ("section_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_name_unique" ON "products" USING btree (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "sections_name_unique" ON "sections" USING btree (lower("name"));