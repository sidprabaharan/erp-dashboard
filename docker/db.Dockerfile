FROM mcr.microsoft.com/mssql/server:2022-latest

# Create a config directory
WORKDIR /usr/config

# Copy initialization script
COPY docker/init-db.sql /usr/config/

# Set environment variables
ENV ACCEPT_EULA=Y
ENV SA_PASSWORD=YourStrong@Password123

# Run Microsoft SQL Server and initialization script
# (Note: we'll use Docker Compose to execute init scripts)
CMD /opt/mssql/bin/sqlservr
