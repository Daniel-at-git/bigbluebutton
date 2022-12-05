require('dotenv').config();
const sha1 = require('sha1');
const path = require('path');
const axios = require('axios');
const { test } = require('@playwright/test');

const httpPath = path.join(path.dirname(require.resolve('axios')), 'lib/adapters/http');
const http = require(httpPath);

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

async function createMeeting(params, customParameter, customMeetingId) {
  const meetingID = (customMeetingId) ? customMeetingId : `random-${getRandomInt(1000000, 10000000).toString()}`;
  const mp = params.moderatorPW;
  const ap = params.attendeePW;
  const query = customParameter !== undefined ? `name=${meetingID}&meetingID=${meetingID}&attendeePW=${ap}&moderatorPW=${mp}`
    + `&allowStartStopRecording=true&${customParameter}&autoStartRecording=false&welcome=${params.welcome}`
    : `name=${meetingID}&meetingID=${meetingID}&attendeePW=${ap}&moderatorPW=${mp}`
    + `&allowStartStopRecording=true&autoStartRecording=false&welcome=${params.welcome}`;
  const apicall = `create${query}${params.secret}`;
  const checksum = sha1(apicall);
  const url = `${params.server}/create?${query}&checksum=${checksum}`;
  await axios.get(url, { adapter: http });
  return meetingID;
}

function getJoinURL(meetingID, params, moderator, customParameter) {
  const pw = moderator ? params.moderatorPW : params.attendeePW;
  const query = customParameter !== undefined ? `fullName=${params.fullName}&meetingID=${meetingID}&password=${pw}&${customParameter}`
    : `fullName=${params.fullName}&meetingID=${meetingID}&password=${pw}`;
  const apicall = `join${query}${params.secret}`;
  const checksum = sha1(apicall);
  return `${params.server}/join?${query}&checksum=${checksum}`;
}

function linkIssue(issueNumber) {
  test.info().annotations.push({
    type: 'Issue/PR',
    description: `https://github.com/bigbluebutton/bigbluebutton/issues/${issueNumber}`,
  });
}

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

exports.getRandomInt = getRandomInt;
exports.createMeeting = createMeeting;
exports.getJoinURL = getJoinURL;
exports.linkIssue = linkIssue;
exports.sleep = sleep;
