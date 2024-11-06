-- CreateTable
CREATE TABLE `TopicCount` (
    `id` VARCHAR(191) NOT NULL,
    `topic` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL,

    UNIQUE INDEX `TopicCount_topic_key`(`topic`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
