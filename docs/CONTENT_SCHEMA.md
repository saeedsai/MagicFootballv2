# Content schema, v1 development sketch

`Match`: `{schemaVersion:1, mode:'enhanced-dev', rulesVersion:'enhanced-dev-0.1', seed, tick, phase, score, players, ball}`. `Player`: `{id:'0-0', side:0, number:1, keeper:false, x,y,vx,vy,facing,cooldown,stun}`. `InputFrame`: `{dx,dy,shoot,pass,tackle,sprint,switch,pause}`.

Original team/roster databases are not yet imported. The roadmap requires separate versioned IDs, content packs, schema validation, custom appearance compatibility and migrations; these remain backlog. Never serialize new unvalidated content into a supposed original Classic save.
