FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# Copy project files
COPY ["src/ERP.API/ERP.API.csproj", "src/ERP.API/"]
COPY ["src/ERP.Core/ERP.Core.csproj", "src/ERP.Core/"]
COPY ["src/ERP.Infrastructure/ERP.Infrastructure.csproj", "src/ERP.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/ERP.API/ERP.API.csproj"

# Copy the rest of the application
COPY . .

# Build the application
WORKDIR "/src/src/ERP.API"
RUN dotnet build "ERP.API.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "ERP.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ERP.API.dll"]
