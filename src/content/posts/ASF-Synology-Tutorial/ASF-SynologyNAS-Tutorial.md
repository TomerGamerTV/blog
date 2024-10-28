---
title: Installing ArchiSteamFarm on SynologyNAS Tutorial
published: 2024-10-19
description: 'A guide on how to install ArchiSteamFarm on SynologyNAS'
image: "https://external-preview.redd.it/s8nIDJqhcQ8pZXUhpGNpQzR50heZQkUO9OGZLUaJm_Q.jpg?auto=webp&s=13a74921520d95214cbc34221d19f25929ec310d"
tags: ["Guide", "Tutorial", "SynologyNAS", "Steam", "Docker"]
category: 'Guides'
draft: false
lang: ''
---

## Installing ArchiSteamFarm on SynologyNAS: A Comprehensive Guide

This guide will walk you through installing [ArchiSteamFarm](https://github.com/JustArchiNET/ArchiSteamFarm) on your Synology NAS. While tailored for Synology users, the general steps are adaptable to other NAS platforms.

**Before We Begin:**

1. **Set Up Custom DDNS:** Go to [this guide](https://mariushosting.com/synology-how-to-enable-https-on-dsm-7/), follow the instructions, and return here.

2. **Set Up Wildcard Certificate:** Follow [this guide](https://mariushosting.com/synology-how-to-add-wildcard-certificate/) until Step 7, then return here.

---

**Installation Steps:**

1. **Install Docker and Portainer:**
   Visit [this guide](https://mariushosting.com/synology-30-second-portainer-install-using-task-scheduler-docker/) by Marius Bogdan Lixandru, which explains how to install both Docker and Portainer on Synology NAS.

___

2. **Prepare Reverse Proxy for ASF:**
   - Head over to [this](https://mariushosting.com/how-to-install-archivebox-on-your-synology-nas/) guide and follow the steps until Step 6.
   - In the General section, set the Reverse Proxy Name to **ArchiSteamFarm**.
   - Add the following under "Source":
      - Protocol: **HTTPS**
      - Hostname: `asf.yourname.synology.me`
      >Replace "yourname" with whatever name you chose while setting up the DDNS.
      - Port: `443`
      - Check **Enable HSTS**
   - Under "Destination":
      - Protocol: **HTTP**
      - Hostname: `localhost`
      - Port: `1242`

***
   **Expected Configuration:**

![**Image 1: This is how it should look.**](https://i.ibb.co/Khb18Xp/image.png)

___

3. **Creating Folders:**
  Now, return to [this guide](https://mariushosting.com/how-to-install-archivebox-on-your-synology-nas/) and follow the steps until **Step 10**. *(Do not complete Step 10!)*
  Instead of creating a folder named "archivebox," create a folder called `ASF`. Inside this folder, create three subfolders:
   - `plugins`
   - `logs`
   - `config`

   **Folder Structure:**

   ![Folders](https://i.ibb.co/GHSDXwm/image-1.png)

___

4. **Configure ASF on PC:**
   - Follow the [wiki](https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Setting-up) instructions on how to set up ASF on your PC. This is a one-time step for configuration purposes.
   - Once configured and logged in with your Steam account, proceed to Step 5.

___

5. **Transfer Configuration Files:**
   - Open the `config` folder within the downloaded ASF directory on your PC.
   - Locate the previously created `config` folder on your NAS.
   - Drag and drop all files from the PC's `config` folder to the NAS's `config` folder.

___

6. **Create and Configure IPC.config:**
   - Open the text editor on your NAS.
   - Paste the following code:

     ```js
     {
         "Kestrel": {
             "Endpoints": {
                 "HTTP": {
                     "Url": "http://*:1242"
                 }
             }
         }
     }
     ```

   - Save the file as `IPC.config` within the `/docker/ASF/config` folder on your NAS.

___

7. **Deploy ASF using Portainer:**
   - Open Portainer and navigate to the settings.
   - Nevigate to the App Templates section.
   - In the URL Paste this: `https://raw.githubusercontent.com/Lissy93/portainer-templates/main/templates.json`
   - Save application settings and go to Templates > Application.

   ![alt text](https://i.ibb.co/k5vdGv4/image.png)

   - Follow the screenshot bellow and click on the ArchiSteamFarm template.
![alt text](https://i.ibb.co/M5wHqpJ/image.png)
   - Find your UID and GID using [this](https://mariushosting.com/synology-find-uid-userid-and-gid-groupid-in-5-seconds/) guide.
   - Replace both PUID and PGID numbers in the template with the ones you recived from the email. (They are named UID and GID)
   - Click on `Show advanced options`
   ![alt text](https://i.ibb.co/VLBHbsJ/image.png)
   - Copy these lines and put them exactly like how i did it in the image below:
   1. `/volume1/docker/ASF/config`
   2. `/volume1/docker/ASF/logs`
   3. `/volume1/docker/ASF/plugins`

   **Expected Configuration:**
   ![alt text](https://i.ibb.co/M7L8vB1/image.png)

   - Scroll down and click "Deploy the container."
   - Wait for a few minutes for deployment to complete. You should see something like a "Container successfully deployed" notification.

8. **Access ASF:**
   - Open a new web browser window and navigate to `https://asf.yourname.synology.me` (replace "yourname" with the custom DDNS you made earlier).
   - If everything is configured correctly, you should see the ASF login page!
  ![alt text](https://i.ibb.co/SRtQzcQ/image-4.png)

---

9. **Optional Step: Container Management**
Go to the **Containers** section in Portainer and search for a container with a name similar to `archisteamfarm`. If you want to rename it, click on the container name and press the **Edit** button. Rename the container as desired.
![alt text](https://i.ibb.co/QQgM9MQ/image-5.png)

If you want the container to automatically restart after crashes or power outages, scroll to the bottom of the page, find the **RESTART POLICIES** in the "Container details" area, and set it to `Unless Stopped`. Hit **Update**.

![alt text](https://i.ibb.co/WvWkGgM/image-6.png)
---

## Congratulations

You’ve successfully set up ArchiSteamFarm on your SynologyNAS! 🥳

---

### Sources and Credits

- Special thanks to [Marius Bogdan Lixandru](https://mariushosting.com/author/marius/) for creating the guides that inspired this tutorial. You can support his work [here](https://mariushosting.com/support-my-work/).
- Thanks to [Portainer Templates](https://portainer-templates.as93.net/archisteamfarm) for providing the template I used and modified.
- And of course, a little credit to [me](https://slat.cc/TomerGamerTV) for writing this tutorial! 😉
