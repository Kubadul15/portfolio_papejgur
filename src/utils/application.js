// Stan podania (wlasciciel, rola obslugi, rola po akceptacji, status)
// jest trzymany w temacie kanalu ticketu podania - zero pamieci po
// stronie bota, przetrwa restart. Format:
// "owner:<id>|support:<id>|accept:<id albo puste>|status:<kod>"
const STATUSES = ['new', 'review', 'accepted', 'rejected'];

function buildApplicationTopic({ ownerId, supportRoleId, acceptRoleId, status }) {
  const resolvedStatus = STATUSES.includes(status) ? status : 'new';
  return `owner:${ownerId}|support:${supportRoleId}|accept:${acceptRoleId || ''}|status:${resolvedStatus}`;
}

function parseApplicationTopic(topic) {
  if (!topic) return null;

  const ownerMatch = /owner:(\d+)/.exec(topic);
  const supportMatch = /support:(\d+)/.exec(topic);
  if (!ownerMatch || !supportMatch) return null;

  const acceptMatch = /accept:(\d+)/.exec(topic);
  const statusMatch = /status:(\w+)/.exec(topic);

  return {
    ownerId: ownerMatch[1],
    supportRoleId: supportMatch[1],
    acceptRoleId: acceptMatch ? acceptMatch[1] : null,
    status: statusMatch && STATUSES.includes(statusMatch[1]) ? statusMatch[1] : 'new',
  };
}

module.exports = { buildApplicationTopic, parseApplicationTopic };
