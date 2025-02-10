FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["EventPhotos.API/EventPhotos.API.csproj", "EventPhotos.API/"]
RUN dotnet restore "EventPhotos.API/EventPhotos.API.csproj"
COPY . .
WORKDIR "/src/EventPhotos.API"
RUN dotnet build "EventPhotos.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "EventPhotos.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "EventPhotos.API.dll"] 