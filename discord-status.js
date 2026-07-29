(function () {
  var USER_ID = '1180302973159616636';
  var REST = 'https://api.lanyard.rest/v1/users/' + USER_ID;
  var WS = 'wss://api.lanyard.rest/socket';

  var avatar = document.getElementById('discordAvatar');
  var dotEl = document.getElementById('discordStatusDot');
  var textEl = document.getElementById('discordStatusText');
  var actBlock = document.getElementById('discordActivityBlock');
  var actIcon = document.getElementById('discordActivityIcon');
  var actName = document.getElementById('discordActivityName');
  var actState = document.getElementById('discordActivityState');
  if (!avatar || !dotEl || !textEl || !actBlock || !actIcon || !actName || !actState) return;

  var DISCORD_ICON = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" fill="#5865f2"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83A72.37,72.37,0,0,0,45.64,0a105.89,105.89,0,0,0-26.11,8.09Q2.46,31.73,0,54.91a113.75,113.75,0,0,0,33.38,17.15a70.72,70.72,0,0,0,7.11-11.55a68.67,68.67,0,0,1-11.2-5.34a75.65,75.65,0,0,0,2.34-1.82A79.18,79.18,0,0,0,63.54,70.51a79,79,0,0,0,31.9-17.08a62.83,62.83,0,0,0,2.38,1.82A68.68,68.68,0,0,1,86.65,60.5a70.21,70.21,0,0,0,7.11,11.55a113.62,113.62,0,0,0,33.38-17.15C125,34.25,118.12,17.78,107.7,8.07ZM42.56,47.21c-3.5,0-6.36-3.21-6.36-7.14s2.82-7.17,6.36-7.17s6.36,3.22,6.36,7.17S46.06,47.21,42.56,47.21Zm42,0c-3.5,0-6.36-3.21-6.36-7.14s2.82-7.17,6.36-7.17s6.36,3.22,6.36,7.17S88.06,47.21,84.59,47.21Z"/></svg>');
  avatar.src = DISCORD_ICON;

  var STATUS_MAP = {
    online: { label: 'En l\xednea', color: '#43b581' },
    idle: { label: 'Ausente', color: '#faa61a' },
    dnd: { label: 'No molestar', color: '#f04747' },
    offline: { label: 'Desconectado', color: '#747f8d' },
  };

  var TYPE_PREFIX = {
    0: 'Jugando',
    1: 'Transmitiendo',
    2: 'Escuchando',
    3: 'Viendo',
    5: 'Comptiendo en',
  };

  function avatarUrl(hash, size) {
    if (!hash) return '';
    size = size || 32;
    var ext = hash.indexOf('a_') === 0 ? 'gif' : 'png';
    return 'https://cdn.discordapp.com/avatars/' + USER_ID + '/' + hash + '.' + ext + '?size=' + size;
  }

  function activityLabel(act) {
    if (!act) return '';
    var prefix = TYPE_PREFIX[act.type] || '';
    var parts = [];
    if (prefix) parts.push(prefix);
    if (act.name) parts.push(act.name);
    return parts.join(' ');
  }

  function activityState(act) {
    if (!act) return '';
    var detailParts = [];
    if (act.details) detailParts.push(act.details);
    if (act.state) detailParts.push(act.state);
    return detailParts.join(' — ');
  }

  var IMG_PROXY = 'https://images.weserv.nl/?url=';

  var blobCache = {};

  function loadImageBlob(imgEl, url, fallback) {
    if (!imgEl || !url && !fallback) return;
    if (!url) { loadImageBlob(imgEl, fallback); return; }
    if (url.indexOf('data:') === 0) {
      imgEl.src = url;
      imgEl.style.display = '';
      return;
    }
    // Solo usar fetch+blob para URLs que soportan CORS (proxy de imágenes)
    if (url.indexOf('images.weserv.nl') !== -1 || url.indexOf('wsrv.nl') !== -1) {
      if (blobCache[url]) {
        imgEl.src = blobCache[url];
        imgEl.style.display = '';
        return;
      }
      var self = imgEl;
      fetch(url, { mode: 'cors' })
        .then(function (r) {
          if (!r.ok) throw new Error('fetch fail');
          return r.blob();
        })
        .then(function (blob) {
          var blobUrl = URL.createObjectURL(blob);
          blobCache[url] = blobUrl;
          self.src = blobUrl;
          self.style.display = '';
        })
        .catch(function () {
          if (fallback && url !== fallback) {
            loadImageBlob(self, fallback);
          } else {
            self.style.display = 'none';
          }
        });
    } else {
      // URL directa sin CORS (Discord CDN, etc.) — establecer src directamente
      imgEl.src = url;
      imgEl.style.display = '';
      imgEl.onerror = function () {
        if (fallback && this.src !== fallback) {
          this.src = fallback;
          this.onerror = null;
        } else {
          this.style.display = 'none';
        }
      };
    }
  }

  function activityImageUrl(act, direct) {
    if (!act || !act.assets || !act.assets.large_image) return '';
    var img = act.assets.large_image;
    var appId = act.application_id;

    // mp:external/{hash}/{encoded_url}
    if (img.indexOf('mp:external/') === 0) {
      var rest = img.slice('mp:external/'.length);
      var slash = rest.indexOf('/');
      if (slash === -1) return '';
      var encoded = rest.slice(slash + 1);
      var rawUrl = '';
      try {
        rawUrl = decodeURIComponent(encoded);
      } catch (e) {
        rawUrl = encoded;
      }
      rawUrl = rawUrl.replace(/^https\//, 'https://').replace(/^http\//, 'http://');
      var m = rawUrl.match(/https?:\/\/[^?\s]+/);
      if (m) {
        rawUrl = m[0];
      }
      rawUrl = rawUrl.replace(/\/+$/, '');
      if (rawUrl.indexOf('http') === 0) {
        return direct ? rawUrl : IMG_PROXY + encodeURIComponent(rawUrl);
      }
      return '';
    }

    // mp:{app_id}/{asset_hash}
    if (img.indexOf('mp:') === 0) {
      var h = img.slice(3);
      if (appId && h) {
        return 'https://cdn.discordapp.com/app-assets/' + appId + '/' + h + '.png?size=64';
      }
    }

    // asset_id directo (ej. Modrinth: '1137523880718762015')
    if (appId && img.indexOf('mp:') !== 0 && img.indexOf('/') === -1) {
      return 'https://cdn.discordapp.com/app-assets/' + appId + '/' + img + '.png?size=64';
    }

    return '';
  }

  var dropdown = document.getElementById('discordDropdown');
  var presenceEl = document.getElementById('discordPresence');
  var dropdownActLink = document.getElementById('discordDropdownActivityLink');
  var dropdownActText = document.getElementById('discordDropdownActivityText');
  var dropdownActImgWrap = document.getElementById('discordDropdownActivityIconWrap');
  var dropdownActImg = document.getElementById('discordDropdownActivityImg');

  function activityUrl(act, spotify) {
    if (spotify) return 'https://open.spotify.com/track/' + spotify.track_id;
    if (act && act.assets && act.assets.large_url) return act.assets.large_url;
    if (act && act.url) return act.url;
    return '';
  }

  var lastData = null;

  function update(data) {
    lastData = data;
    var status = data.discord_status || 'offline';
    var info = STATUS_MAP[status] || STATUS_MAP.offline;

    avatar.alt = (data.discord_user && data.discord_user.global_name) || '';
    var avUrl = avatarUrl(data.discord_user && data.discord_user.avatar, 40);
    if (avUrl) {
      loadImageBlob(avatar, avUrl, DISCORD_ICON);
    } else {
      avatar.src = DISCORD_ICON;
    }

    dotEl.style.background = info.color;
    dotEl.title = info.label;
    textEl.textContent = info.label;

    var customStatus = '';
    var activity = null;

    if (data.activities && data.activities.length) {
      for (var i = 0; i < data.activities.length; i++) {
        var act = data.activities[i];

        if (act.type === 4) {
          var emoji = act.emoji ? act.emoji.name + ' ' : '';
          customStatus = emoji + (act.state || '');
          continue;
        }

        if (act.type === 0 || act.type === 1 || act.type === 2 || act.type === 3 || act.type === 5) {
          if (!activity) activity = act;
        }
      }
    }

    if (data.listening_to_spotify && data.spotify) {
      var spot = data.spotify;
      actBlock.style.display = '';
      actIcon.alt = spot.album || '';
      actName.textContent = spot.song;
      actState.textContent = 'Spotify \u2014 ' + spot.artist;
      if (spot.album_art_url) {
        loadImageBlob(actIcon, spot.album_art_url);
      } else {
        actIcon.style.display = 'none';
      }
      updateActivityDropdown(activity, data);
      return;
    }

    if (activity) {
      actBlock.style.display = '';

      var imgUrl = activityImageUrl(activity);
      var directUrl = activityImageUrl(activity, true);
      if (imgUrl) {
        loadImageBlob(actIcon, imgUrl, directUrl);
      } else {
        actIcon.style.display = 'none';
      }

      if (activity.type === 2) {
        actName.textContent = '\uD83C\uDFB5 ' + (activity.details || activity.name);
        actState.textContent = activity.name + ' \u2014 ' + (activity.state || '');
      } else {
        actName.textContent = activityLabel(activity);
        actState.textContent = activityState(activity) || customStatus || '';
      }
    } else {
      actBlock.style.display = customStatus ? '' : 'none';
      if (customStatus) {
        actIcon.style.display = 'none';
        actName.textContent = customStatus;
        actState.textContent = '';
      }
    }
    updateActivityDropdown(activity, data);
  }

  function updateActivityDropdown(activity, data) {
    if (!dropdownActLink || !dropdownActText) return;
    var url = '';
    var label = 'Ninguna';
    var imgSrc = '';

    if (data && data.listening_to_spotify && data.spotify) {
      var s = data.spotify;
      url = activityUrl(null, data.spotify);
      label = '\uD83C\uDFB5 ' + s.song + ' \u2014 ' + s.artist;
      imgSrc = s.album_art_url || '';
    } else if (activity) {
      url = activityUrl(activity);
      if (activity.type === 2) {
        label = '\uD83C\uDFB5 ' + (activity.details || activity.name) + ' \u2014 ' + (activity.state || activity.name);
      } else {
        label = activityLabel(activity) + (activityState(activity) ? ' \u2014 ' + activityState(activity) : '');
      }
      var iu = activityImageUrl(activity);
      if (!iu) iu = activityImageUrl(activity, true);
      if (iu) imgSrc = iu;
    }

    if (url) {
      dropdownActLink.href = url;
      dropdownActLink.style.cursor = 'pointer';
      dropdownActLink.style.opacity = '1';
    } else {
      dropdownActLink.href = '#';
      dropdownActLink.style.cursor = 'default';
      dropdownActLink.style.opacity = '0.5';
    }

    dropdownActText.textContent = label;
    dropdownActText.title = label;

    if (imgSrc) {
      dropdownActImgWrap.style.display = '';
      loadImageBlob(dropdownActImg, imgSrc);
    } else {
      dropdownActImgWrap.style.display = 'none';
    }
  }

  if (presenceEl && dropdown) {
    presenceEl.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    document.addEventListener('click', function (e) {
      if (!presenceEl.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });

    dropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  function setOffline() {
    dotEl.style.background = STATUS_MAP.offline.color;
    dotEl.title = STATUS_MAP.offline.label;
    textEl.textContent = STATUS_MAP.offline.label;
  }

  fetch(REST)
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.success && d.data) {
        update(d.data);
      } else {
        setOffline();
      }
    })
    .catch(function () {
      setOffline();
    });

  try {
    var ws = new WebSocket(WS);
    var heartbeat;

    ws.onopen = function () {
      ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: USER_ID } }));
    };

    ws.onmessage = function (e) {
      try {
        var msg = JSON.parse(e.data);

        if (msg.op === 1) {
          var interval = (msg.d && msg.d.heartbeat_interval) || 30000;
          if (heartbeat) clearInterval(heartbeat);
          heartbeat = setInterval(function () {
            ws.send(JSON.stringify({ op: 3 }));
          }, interval);
        }

        if (msg.op === 0) {
          if ((msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE') && msg.d) {
            var presence = msg.d;
            if (presence.discord_status) update(presence);
          }
        }
      } catch (_) {}
    };

    ws.onclose = function () {
      if (heartbeat) clearInterval(heartbeat);
    };
  } catch (_) {}
})();
