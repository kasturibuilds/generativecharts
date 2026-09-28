CREATE TABLE `analytics_budget` (
	`id` integer PRIMARY KEY NOT NULL,
	`minute` integer NOT NULL,
	`minute_count` integer NOT NULL,
	`day` text NOT NULL,
	`day_count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `analytics_daily` (
	`day` text NOT NULL,
	`event` text NOT NULL,
	`path` text NOT NULL,
	`value` text DEFAULT '' NOT NULL,
	`source` text NOT NULL,
	`campaign` text NOT NULL,
	`referrer` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `event`, `path`, `value`, `source`, `campaign`, `referrer`)
);
--> statement-breakpoint
CREATE TABLE `analytics_visitors` (
	`day` text NOT NULL,
	`visitor_id` text NOT NULL,
	PRIMARY KEY(`day`, `visitor_id`)
);
