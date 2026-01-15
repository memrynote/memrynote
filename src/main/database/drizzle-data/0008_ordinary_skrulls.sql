CREATE TABLE `local_devices` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`platform` text NOT NULL,
	`os_version` text,
	`app_version` text NOT NULL,
	`linked_at` text DEFAULT (datetime('now')) NOT NULL,
	`last_sync_at` text,
	`is_current_device` integer DEFAULT false,
	`revoked_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_local_devices_current` ON `local_devices` (`is_current_device`);--> statement-breakpoint
CREATE INDEX `idx_local_devices_revoked` ON `local_devices` (`revoked_at`);--> statement-breakpoint
CREATE TABLE `sync_history` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`item_count` integer NOT NULL,
	`direction` text,
	`details` text,
	`duration_ms` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sync_history_created` ON `sync_history` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_sync_history_type` ON `sync_history` (`type`);--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`item_id` text NOT NULL,
	`operation` text NOT NULL,
	`payload` text NOT NULL,
	`priority` integer DEFAULT 0,
	`attempts` integer DEFAULT 0,
	`last_attempt` text,
	`error_message` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sync_queue_type` ON `sync_queue` (`type`);--> statement-breakpoint
CREATE INDEX `idx_sync_queue_status` ON `sync_queue` (`status`);--> statement-breakpoint
CREATE INDEX `idx_sync_queue_created` ON `sync_queue` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_sync_queue_priority` ON `sync_queue` (`priority`);--> statement-breakpoint
CREATE TABLE `sync_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
