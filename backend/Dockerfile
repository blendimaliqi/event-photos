FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["EventPhotos.API/EventPhotos.API.csproj", "EventPhotos.API/"]
RUN dotnet restore "EventPhotos.API/EventPhotos.API.csproj"
COPY . .
WORKDIR "/src/EventPhotos.API"
RUN dotnet build "EventPhotos.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "EventPhotos.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create all required uploads directories with proper permissions
RUN mkdir -p /app/uploads/photos /app/uploads/videos /app/uploads/thumbnails && \
    mkdir -p /app/uploads && \
    chmod -R 755 /app/uploads

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "EventPhotos.API.dll"] 