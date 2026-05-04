---
title: Installing Seanime on SynologyNAS with Portainer
published: 2026-05-04
description: 'A guide on how to install Seanime on SynologyNAS with Portainer, Docker Compose, Intel hardware acceleration, and the correct Synology folder mounts.'
image: ''
tags: ["Guide", "Tutorial", "SynologyNAS", "Portainer", "Docker", "Seanime", "Anime"]
category: 'Guides'
draft: false
lang: ''
---

## Installing Seanime on SynologyNAS with Portainer

This guide shows how to install [Seanime](https://seanime.rahim.app/) on a Synology NAS using Portainer.

We will use the `latest-hwaccel` Docker image from [umag/seanime-docker](https://github.com/umag/seanime-docker), which includes Intel QSV / VAAPI hardware acceleration support.

---

## Docker Image Options

The Docker image has multiple tags. Pick the one that matches your setup:

| Image tag | Runs as | Best for |
| --- | --- | --- |
| `umagistr/seanime:latest` | `root` | The default image. Use this if you want the simplest setup and do not need rootless mode or hardware acceleration. |
| `umagistr/seanime:latest-rootless` | `seanime` user | A safer rootless setup without hardware acceleration. |
| `umagistr/seanime:latest-hwaccel` | `seanime` user | Intel QSV / VAAPI hardware acceleration. This is the image used in this guide. |
| `umagistr/seanime:latest-cuda` | `seanime` user | NVIDIA CUDA / NVENC hardware acceleration. |

The default image looks like this:

```yaml
image: umagistr/seanime:latest
```

For this Synology guide, we will use:

```yaml
image: umagistr/seanime:latest-hwaccel
```

If your NAS does not have Intel graphics exposed through `/dev/dri`, use `latest` or `latest-rootless` instead.

---

## Before We Begin

You need:

1. A Synology NAS with Docker / Container Manager installed.
2. Portainer installed and connected to your local Docker environment.
3. A folder for Docker data, for example:

   ```text
   /volume1/docker
   ```

   Most Synology setups use `/volume1` by default. If your Docker folder or media library is stored on another volume, such as `/volume2` or `/volume3`, replace `/volume1` in this guide with your actual volume number.

4. Your Synology user and group IDs.

For this guide, I will use:

```text
PUID: 1024
PGID: 100
```

If your IDs are different, replace `1024:100` in the compose file with your own values.

> Seanime does not use LinuxServer-style `PUID` and `PGID` environment variables. For the rootless and hardware-accelerated images, use Docker Compose's native `user:` option instead.

---

## Step 1: Create the Seanime Folder

Open File Station or SSH and create this folder:

```text
/volume1/docker/seanime
```

Inside it, create these folders:

```text
/volume1/docker/seanime/config
/volume1/docker/seanime/downloads
```

You do not need to put your anime library inside `/volume1/docker/seanime`.

For example, if your anime library is stored in Synology Drive and appears on Windows as:

```text
Z:\admin\Drive\Anime
```

the NAS path is usually:

```text
/volume1/homes/admin/Drive/Anime
```

That path will be mounted into the container as:

```text
/anime
```

---

## Step 2: Fix Folder Permissions

Make sure the folders are writable by your Synology user.

If your user is `1024` and your group is `100`, the ownership should match:

```text
1024:100
```

If you use SSH, you can run:

```bash
sudo chown -R 1024:100 /volume1/docker/seanime
sudo chmod -R 775 /volume1/docker/seanime
```

If your anime folder is in Synology Drive, also make sure the same user can read it:

```bash
sudo chown -R 1024:100 /volume1/homes/admin/Drive/Anime
```

Only run that command if you are sure you want to change ownership of that folder.

---

## Step 3: Create the Stack in Portainer

Open Portainer and go to:

```text
Stacks -> Add stack
```

Name the stack:

```text
seanime
```

Paste this compose file:

```yaml
services:
  seanime:
    image: umagistr/seanime:latest-hwaccel
    container_name: seanime
    user: "1024:100"
    devices:
      - /dev/dri:/dev/dri
    group_add:
      - "44"
      - "107"
    ports:
      - "3211:43211"
    volumes:
      - /volume1/docker/seanime/config:/home/seanime/.config/Seanime
      - /volume1/homes/admin/Drive/Anime:/anime
      - /volume1/docker/seanime/downloads:/downloads
    environment:
      HOME: /home/seanime
      XDG_CONFIG_HOME: /home/seanime/.config
      TZ: Your/Timezone # Use https://timezone.mariushosting.com/ to figure yours out
    restart: unless-stopped
```

Then click:

```text
Deploy the stack
```

---

## Why These Settings Matter

### `latest-hwaccel`

This image variant includes Jellyfin FFmpeg and Intel drivers for QSV / VAAPI hardware acceleration.

```yaml
image: umagistr/seanime:latest-hwaccel
```

### `user: "1024:100"`

This makes Seanime run as your Synology user instead of the image's default user.

```yaml
user: "1024:100"
```

Do not add this:

```yaml
environment:
  PUID: 1024
  PGID: 100
```

Seanime's image does not use those variables.

### `/dev/dri`

This passes the Intel GPU device into the container:

```yaml
devices:
  - /dev/dri:/dev/dri
```

### Numeric GPU Groups

Some Synology setups do not expose group names like `video` and `render` inside the container correctly.

If you use this:

```yaml
group_add:
  - video
  - render
```

Docker may fail with:

```text
Unable to find group render: no matching entries in group file
```

Use numeric group IDs instead:

```yaml
group_add:
  - "44"
  - "107"
```

### `HOME` and `XDG_CONFIG_HOME`

When overriding the container user, Seanime may try to create config files in:

```text
/.config
```

That fails with:

```text
mkdir /.config: permission denied
```

Fix it by setting:

```yaml
environment:
  HOME: /home/seanime
  XDG_CONFIG_HOME: /home/seanime/.config
```

---

## Step 4: Change Seanime's Listen Host

After first startup, Seanime may generate this in:

```text
/volume1/docker/seanime/config/config.toml
```

```toml
[server]
host = '127.0.0.1'
port = 43211
```

That makes the app reachable only inside the container. Docker port forwarding will connect, but the browser may get a connection reset.

Change it to:

```toml
[server]
host = '0.0.0.0'
port = 43211
```

Then restart the Seanime container from Portainer.

---

## Step 5: Open Seanime

Open:

```text
http://YOUR-NAS-IP:3211
```

For example:

```text
http://192.168.68.75:3211
```

If everything worked, you should see the Seanime setup page.

---

## Step 6: Configure the Anime Library

When Seanime asks for your anime library path, use the container path:

```text
/anime
```

Do not enter your Windows path:

```text
Z:\admin\Drive\Anime
```

Do not enter the NAS host path:

```text
/volume1/homes/admin/Drive/Anime
```

The Docker mount maps the NAS folder to `/anime`, so Seanime only needs:

```text
/anime
```

---

## Step 7: Configure the Download Folder

If you use qBittorrent and want Seanime to manage downloads, make sure both containers agree on the same folder.

For example, if qBittorrent stores downloads here:

```text
/volume1/docker/qbittorrent-vue/downloads
```

then use this Seanime mount instead:

```yaml
- /volume1/docker/qbittorrent-vue/downloads:/downloads
```

In Seanime, set the downloads path to:

```text
/downloads
```
(Your setup might look different than mine)

---

## Step 8: Configure qBittorrent

If your qBittorrent WebUI runs on the NAS, configure Seanime like this:

```text
Client: qBittorrent
Host: YOUR-NAS-IP
Port: YOUR-QBITTORRENT-WEBUI-PORT
Username: your qBittorrent username
Password: your qBittorrent password
```

Example:

```text
Host: 192.168.68.50
Port: 9866
```

Leave the executable path as:

```text
/usr/bin/qbittorrent
```

VueTorrent users: VueTorrent is only the qBittorrent web interface theme. Seanime still connects to qBittorrent.

---

## Optional: Add a Synology Reverse Proxy

If you want to access Seanime using a domain like:

```text
https://seanime.example.duckdns.org
```

open DSM and go to:

```text
Control Panel -> Login Portal -> Advanced -> Reverse Proxy
```

Create a new rule:

### Source

```text
Protocol: HTTPS
Hostname: seanime.example.duckdns.org
Port: 443
```

### Destination

```text
Protocol: HTTP
Hostname: localhost
Port: 3211
```

Then assign a valid certificate for the domain in DSM.

---

## Troubleshooting

### Container says `Unable to find group render`

Use numeric groups:

```yaml
group_add:
  - "44"
  - "107"
```

### Container says `mkdir /.config: permission denied`

Add:

```yaml
environment:
  HOME: /home/seanime
  XDG_CONFIG_HOME: /home/seanime/.config
```

### Browser says connection reset

Edit:

```text
/volume1/docker/seanime/config/config.toml
```

Change:

```toml
host = '127.0.0.1'
```

to:

```toml
host = '0.0.0.0'
```

Then restart the container.

### Updating the Anime Mount Later

If you change a volume mount in Portainer, a normal container restart is not enough.

You need to update the stack and redeploy it. You do not need to repull the image unless you want to update the image too.

---

## Congratulations

You now have Seanime running on Synology NAS through Portainer with:

- Intel hardware acceleration support
- Synology-friendly permissions
- A persistent config folder
- A mounted anime library
- Optional qBittorrent integration
- Optional reverse proxy access

---

## Sources and Credits

- [Seanime](https://seanime.rahim.app/)
- [Seanime Docker image by umag](https://github.com/umag/seanime-docker)
- [Portainer documentation](https://docs.portainer.io/)
- [Synology DSM reverse proxy documentation](https://kb.synology.com/)
