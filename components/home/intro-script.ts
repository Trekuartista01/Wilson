// Inline script for the homepage intro (IntroAnimation.tsx), rendered in the root layout's
// <head> (a server-only spot that React never re-renders on the client, so it runs exactly once
// per full page load). Does nothing outside the homepage (/sq, /en, /de). Runs before the first
// paint: "play" for the first homepage load in this browser session (at the top, motion allowed),
// "done" otherwise. Forces "done" after 10s in case the animation never gets to run
// (IntroAnimation skips itself if it starts more than 4s in, so a real run always ends first).

const SESSION_KEY = "wilson-intro";

export const INTRO_SCRIPT = `(function(){var p=location.pathname;if(p.length>1&&p.charAt(p.length-1)=="/")p=p.slice(0,-1);if(["/sq","/en","/de"].indexOf(p)<0)return;var d=document.documentElement;try{if(sessionStorage.getItem("${SESSION_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches||window.scrollY>0){d.dataset.intro="done";return}sessionStorage.setItem("${SESSION_KEY}","1")}catch(e){d.dataset.intro="done";return}d.dataset.intro="play";setTimeout(function(){d.dataset.intro="done"},10000)})()`;
