# Nemesis

The purpose of this webtool is to make a Waitlist Managers and Fleetcommanders job a bit less painful,
simple x-up with ship fitting via copy & paste from ingame as well as simple authentication via Eve SSO. Integrates with the Eve 
IGB to show fittings, characters, corporations and to directly invite pilots from the waitlist.
On the other hand it also works perfectly fine in Chrome (great to have it on that third monitor).

## Features 

- create new waitlists, choose an arbitrary name e.g. *E-UNI Vanguard Fleet (FORMING)*
- share a waitlist via URL (WL Linky) or pilots may browse the home page for lists.
- pilots may post one or multiple fits and can indicate their fleet-role
- timers to indicate how long pilots have been in the queue
- basic statistics to get a quick grasp whats on the list
- automatically updates
- works in Chrome as well as in Eve IGB
- integrates with the Eve IGB, view fits, show character info, show corp/alliance
- owner can pass on control of his waitlists
- secure, easy login via Eve SSO. No new passwords or API keys.
- free and open source



## Getting started

Prerequisites:
- install `mysql` server e.g. `sudo apt-get install mysql-server`
- install `nodejs` and `npm`

1. check out this repository
2. install dependencies with `npm install`
3. setup Eve SSO app
  1. Register an Eve SSO application here: https://developers.eveonline.com/resource/single-sign-on
  1. `cp src/config/evesso.example.json  src/config/evesso.json`
  2. `nano src/config/evesso.json` and add your key
  3. edit `src/config/config.json` to reflect your `eveSsoCallback`, it must match your host and should end with `/nemesis/api/auth/callback`
4. setup the database
  2. setup a new database e.g. `CREATE SCHEMA nemesis;`
  3. optional: set up a new db user
  3. edit `src/config/config.json` to reflect you database configuration
5. start nemesis
  1. depending on you `config.json` set the environment variable `NODE_ENV` e.g. `export NODE_ENV=production`
  2. start the server with `npm start`

Feel free to open a new issue if you run into troubles.

## Security

### Authentication
All data and actions via the tool are authenticated by Eve SSO.

### Authorization
Pilots can only manipulate their own entries.

### Confidentiality
All content is served via TLS, which provides server authentication and confidentiality as well as integrity.

### Privacy
No private data except the posted ship fitting is saved.

Login via Eve SSO leaks no information
to the tool except the pilots ID. To make sure there is no phishing involved you may check
the TLS certificate on the SSO page (should be CCP).

After login, public data of the pilot is fetched from the official CCP API and
locally cached (character name, corporation, alliance, ...). Images are directly fetched from the
official CCP servers.

### Common Exploits
All user input is sanitized and escaped,
to my knowledge the tool is save from XSS and SQL injections.

## Authors
see public/humans.txt
