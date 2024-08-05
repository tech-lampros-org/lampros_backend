#!/bin/bash

# Define the root directory
ROOT_DIR="."

# Create the root directory
mkdir -p $ROOT_DIR

# Define subdirectories and files
declare -A DIRS_FILES=(
    ["$ROOT_DIR/config"]="dbConfig.js serverConfig.js mailConfig.js cacheConfig.js jwtConfig.js loggingConfig.js smtpConfig.js cloudConfig.js"
    ["$ROOT_DIR/controllers"]="userController.js estimateController.js paymentController.js roleController.js"
    ["$ROOT_DIR/models"]="userModel.js estimateModel.js paymentModel.js roleModel.js"
    ["$ROOT_DIR/routes"]="userRoutes.js estimateRoutes.js paymentRoutes.js roleRoutes.js"
    ["$ROOT_DIR/middlewares"]="authMiddleware.js errorHandler.js requestLogger.js rateLimiter.js corsMiddleware.js inputValidation.js"
    ["$ROOT_DIR/services"]="userService.js estimateService.js paymentService.js roleService.js"
    ["$ROOT_DIR/repositories"]="userRepository.js estimateRepository.js paymentRepository.js roleRepository.js"
    ["$ROOT_DIR/jobs"]="emailJob.js paymentJob.js cleanupJob.js dataSyncJob.js"
    ["$ROOT_DIR/utils"]="validators.js helpers.js constants.js logger.js encryption.js"
    ["$ROOT_DIR/docs"]="apiDocumentation.md architecture.md"
    ["$ROOT_DIR/scripts"]="seedDatabase.js deploy.js migrateDatabase.js"
    ["$ROOT_DIR/tests/unit"]="userService.test.js estimateService.test.js"
    ["$ROOT_DIR/tests/integration"]="userRoutes.test.js estimateRoutes.test.js"
    ["$ROOT_DIR/views"]=""
)

# Create directories and files
for DIR in "${!DIRS_FILES[@]}"; do
    mkdir -p $DIR
    for FILE in ${DIRS_FILES[$DIR]}; do
        touch $DIR/$FILE
    done
done

# Create root files
touch $ROOT_DIR/app.js
touch $ROOT_DIR/package.json
touch $ROOT_DIR/README.md
touch $ROOT_DIR/.env
touch $ROOT_DIR/.gitignore
touch $ROOT_DIR/Dockerfile
touch $ROOT_DIR/docker-compose.yml
touch $ROOT_DIR/.eslintrc.js
touch $ROOT_DIR/.prettierrc

echo "Project structure created successfully."
