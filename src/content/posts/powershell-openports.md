---
title: Open Ports With Powershell on Windows
published: 2024-10-29
description: 'In this mini guide I will show you how to easily open new ports in terminal without needing to open the ugly firewall app'
image: ''
tags: [Tutorial, Powershell, Terminal, Mini]
category: 'Guides'
draft: false 
lang: ''
---

## Intro

Tired of going to control center every time to open your ports? Well i made some commands to make the proccess way quicker and easier because ain't nobody got no time to open that ugly messy app to open some ports.

## Commands

:::note
Remember to change "PORT" to whatever port you want to open.   
And replace " NAME HERE " with whatever display name you want to use.
:::

### Outbound directions

```powershell
New-NetFirewallRule -DisplayName " NAME HERE " -Direction Outbound -Protocol UDP -LocalPort PORT -Action allow
```
```powershell
New-NetFirewallRule -DisplayName " NAME HERE " -Direction Outbound -Protocol TCP -LocalPort PORT -Action allow
```

### Inbount directions
```powershell
New-NetFirewallRule -DisplayName " NAME HERE " -Direction Inbound -Protocol TCP -LocalPort PORT -Action allow
```
```powershell
New-NetFirewallRule -DisplayName " NAME HERE " -Direction Inbound -Protocol UDP -LocalPort PORT -Action allow
```
