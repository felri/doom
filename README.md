# Doom @WIP

Doom (Decentralized Zoom Like App) 


# What is this?

It's a video message app completely decentralized, apart from the turn server (wip™)


https://user-images.githubusercontent.com/56592364/160651811-d241cb9e-7a8e-4011-bb96-b27621f6fecf.mp4

# Download
[Here](https://github.com/felri/doom/releases/) (Mac for now, but you can run it on Windows and Linux building from source)

# How to build? 
[Follow the instructions here](https://github.com/Sprillow/electron-holochain-template#run-locally-and-develop-on-your-computer)

## How does it work?

Let's look at how the most simple Webrtc app ever works:

1 - Peer 1 creates the room 'Daily'

2 - Peer 2 joins 'Daily'

3 - Signaling server broadcast Peer 2 joining event to everybody in the room

4 - Peer 1 receives the alert that Peer 2 joined 

5 - Peer 1 creates a new Webrtc connection and sends it to Peer 2 via signaling server

6 - Peer 2 opens a channel between both peers 

![signaling-server](https://user-images.githubusercontent.com/56592364/160651699-5d2ce8a3-d3e9-4d07-8fe0-59aa6c1ee436.png)

## Gotcha, so how does it work?

Basically it's the same, the most interesting part here is that I'm using [Holochain](https://www.holochain.org/) as a signaling server. 

So instead of a central Signaling server being served from AWS or Azure I'm using Holochain's [distributed hash table](https://en.wikipedia.org/wiki/Distributed_hash_table) to signal peers.

![holochain-server](https://user-images.githubusercontent.com/56592364/160651751-b2e18d7b-085f-4458-a1a0-972c76c6380c.png)

## Pretty cool

Yeah thanks.

