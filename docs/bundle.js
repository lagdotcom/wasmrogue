(function () {
    'use strict';

    var wglt = {exports: {}};

    (function (module, exports) {
    !function(t,i){module.exports=i();}(globalThis,(function(){return (()=>{var t={612:(t,i,e)=>{let s;e.r(i),e.d(i,{BlendMode:()=>s,Cell:()=>E,Chars:()=>c,Colors:()=>A,Console:()=>K,DEFAULT_FONT:()=>V,DefaultDialogRenderer:()=>v,Dialog:()=>b,DialogState:()=>S,Font:()=>O,FovOctants:()=>g,FovQuadrants:()=>N,GUI:()=>I,Keyboard:()=>x,Keys:()=>P,MessageDialog:()=>H,Mouse:()=>Z,Point:()=>R,RNG:()=>ht,Rect:()=>C,SelectDialog:()=>M,Terminal:()=>at,computePath:()=>it,fixBoxCells:()=>_,fromHsv:()=>d,fromRgb:()=>a,getFovQuadrant:()=>L,loadImage:()=>X,loadImage2x:()=>Y}),function(t){t[t.None=0]="None",t[t.Blend=1]="Blend",t[t.Add=2]="Add";}(s||(s={}));const r=[[1,0,1,0],[1,0,1,1],[1,0,1,2],[2,0,2,1],[0,0,2,1],[0,0,1,2],[2,0,2,2],[2,0,2,0],[0,0,2,2],[2,0,0,2],[2,0,0,1],[1,0,0,2],[0,0,1,1],[1,1,0,0],[1,1,0,1],[0,1,1,1],[1,1,1,0],[0,1,0,1],[1,1,1,1],[1,2,1,0],[2,1,2,0],[2,2,0,0],[0,2,2,0],[2,2,0,2],[0,2,2,2],[2,2,2,0],[0,2,0,2],[2,2,2,2],[1,2,0,2],[2,1,0,1],[0,2,1,2],[0,1,2,1],[2,1,0,0],[1,2,0,0],[0,2,1,0],[0,1,2,0],[2,1,2,1],[1,2,1,2],[1,0,0,1],[0,1,1,0]];function h(t,i,e){const s=t.getCharCode(i,e);return void 0!==s&&s>=179&&s<=218}function o(t,i,e,s){if(i<0||e<0||i>=t.width||e>=t.height)return 0;const h=t.getCharCode(i,e);return void 0===h||h<179||h>218?0:r[h-179][s]}function n(t,i,e,s){for(let h=0;h<r.length;h++){const o=r[h];if(o[0]===t&&o[1]===i&&o[2]===e&&o[3]===s)return 179+h}return 0}function _(t){for(let i=0;i<t.height;i++)for(let e=0;e<t.width;e++)if(h(t,e,i)){let s=o(t,e,i-1,2),r=o(t,e+1,i,3),h=o(t,e,i+1,0),_=o(t,e-1,i,1);s>0&&0===r&&0===h&&0===_?h=s:0===s&&r>0&&0===h&&0===_?_=r:0===s&&0===r&&h>0&&0===_?s=h:0===s&&0===r&&0===h&&_>0&&(r=_),_>0&&r>0&&(_=r=Math.max(_,r)),s>0&&h>0&&(s=h=Math.max(s,h));const a=n(s,r,h,_);if((s||r||h||_)&&!(a>=179&&a<=218))throw new Error("invalid char code! (up="+s+", right="+r+", down="+h+", left="+_+")");t.drawChar(e,i,a);}}function a(t,i,e,s){return void 0===s&&(s=255),(t<<24)+(i<<16)+(e<<8)+s}function d(t,i,e,s){const r=6*t|0,h=6*t-r,o=e*(1-i),n=e*(1-h*i),_=e*(1-(1-h)*i);let d,A,l;switch(r%6){case 0:d=e,A=_,l=o;break;case 1:d=n,A=e,l=o;break;case 2:d=o,A=e,l=_;break;case 3:d=o,A=n,l=e;break;case 4:d=_,A=o,l=e;break;case 5:d=e,A=o,l=n;break;default:d=0,A=0,l=0;}return void 0===s&&(s=1),a(255*d|0,255*A|0,255*l|0,255*s|0)}const A={BLACK:a(0,0,0),WHITE:a(255,255,255),LIGHT_GRAY:a(170,170,170),DARK_GRAY:a(85,85,85),YELLOW:a(255,255,85),BROWN:a(170,85,0),LIGHT_RED:a(255,85,85),DARK_RED:a(170,0,0),LIGHT_GREEN:a(85,255,85),DARK_GREEN:a(0,170,0),LIGHT_CYAN:a(85,255,255),DARK_CYAN:a(0,170,170),LIGHT_BLUE:a(85,85,255),DARK_BLUE:a(0,0,170),LIGHT_MAGENTA:a(255,85,255),DARK_MAGENTA:a(170,0,170),ORANGE:a(255,136,0)};function l(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}class E{constructor(t,i,e,s,r){l(this,"x",void 0),l(this,"y",void 0),l(this,"charCode",void 0),l(this,"fg",void 0),l(this,"bg",void 0),l(this,"dirty",void 0),l(this,"blocked",void 0),l(this,"blockedSight",void 0),l(this,"explored",void 0),l(this,"visible",void 0),l(this,"pathId",void 0),l(this,"g",void 0),l(this,"h",void 0),l(this,"prev",void 0),this.x=t,this.y=i,this.charCode=void 0!==e?function(t){return "string"===typeof t&&t.length>0?t.charCodeAt(0):t}(e):" ".charCodeAt(0),this.fg=void 0!==s?s:A.WHITE,this.bg=void 0!==r?r:A.BLACK,this.dirty=!0,this.blocked=!1,this.blockedSight=!1,this.explored=!1,this.visible=!1,this.pathId=-1,this.g=0,this.h=0,this.prev=null;}setCharCode(t){this.charCode!==t&&(this.charCode=t,this.dirty=!0);}setForeground(t){void 0!==t&&null!==t&&t!==this.fg&&(this.fg=t,this.dirty=!0);}setBackground(t){void 0!==t&&null!==t&&t!==this.bg&&(this.bg=t,this.dirty=!0);}setValue(t,i,e){return "string"===typeof t&&(t=t.charCodeAt(0)),"number"===typeof t?(this.setCharCode(t),void 0!==i&&this.setForeground(i),void 0!==e&&this.setBackground(e)):this.drawCell(t,s.None),this.dirty}drawCell(t,i){const e=255&t.bg;i===s.None||t.charCode>0?(this.setCharCode(t.charCode),this.setForeground(t.fg)):e>0&&e<255&&this.setForeground(this.blendColors(this.fg,t.bg,i)),i===s.None||255===e?this.setBackground(t.bg):e>0&&this.setBackground(this.blendColors(this.bg,t.bg,i));}blendColors(t,i,e){const r=(255-(255&i))/255,h=1-r,o=t>>24&255,n=t>>16&255,_=t>>8&255,d=i>>24&255,A=i>>16&255,l=i>>8&255;switch(e){case s.Blend:return a(r*o+h*d|0,r*n+h*A|0,r*_+h*l|0);case s.Add:return a(this.clamp(o+h*d|0),this.clamp(n+h*A|0),this.clamp(_+h*l|0));default:return i}}clamp(t){return Math.min(255,t)}}let c;function u(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}!function(t){t[t.SMILEY=1]="SMILEY",t[t.INVERSE_SMILEY=2]="INVERSE_SMILEY",t[t.HEART=3]="HEART",t[t.DIAMOND=4]="DIAMOND",t[t.CLUB=5]="CLUB",t[t.SPADE=6]="SPADE",t[t.BULLET=7]="BULLET",t[t.INVERSE_BULLET=8]="INVERSE_BULLET",t[t.LIGHT_SHADE=176]="LIGHT_SHADE",t[t.MEDIUM_SHADE=177]="MEDIUM_SHADE",t[t.DARK_SHADE=178]="DARK_SHADE",t[t.BOX_SINGLE_VERTICAL=179]="BOX_SINGLE_VERTICAL",t[t.BOX_SINGLE_VERTICAL_AND_SINGLE_LEFT=180]="BOX_SINGLE_VERTICAL_AND_SINGLE_LEFT",t[t.BOX_DOUBLE_VERTICAL_AND_DOUBLE_LEFT=185]="BOX_DOUBLE_VERTICAL_AND_DOUBLE_LEFT",t[t.BOX_DOUBLE_VERTICAL=186]="BOX_DOUBLE_VERTICAL",t[t.BOX_DOUBLE_DOWN_AND_DOUBLE_LEFT=187]="BOX_DOUBLE_DOWN_AND_DOUBLE_LEFT",t[t.BOX_DOUBLE_UP_AND_DOUBLE_LEFT=188]="BOX_DOUBLE_UP_AND_DOUBLE_LEFT",t[t.BOX_SINGLE_DOWN_AND_SINGLE_LEFT=191]="BOX_SINGLE_DOWN_AND_SINGLE_LEFT",t[t.BOX_SINGLE_UP_AND_SINGLE_RIGHT=192]="BOX_SINGLE_UP_AND_SINGLE_RIGHT",t[t.BOX_SINGLE_HORIZONTAL_AND_SINGLE_UP=193]="BOX_SINGLE_HORIZONTAL_AND_SINGLE_UP",t[t.BOX_SINGLE_HORIZONTAL_AND_SINGLE_DOWN=194]="BOX_SINGLE_HORIZONTAL_AND_SINGLE_DOWN",t[t.BOX_SINGLE_VERTICAL_AND_SINGLE_RIGHT=195]="BOX_SINGLE_VERTICAL_AND_SINGLE_RIGHT",t[t.BOX_SINGLE_HORIZONTAL=196]="BOX_SINGLE_HORIZONTAL",t[t.BOX_SINGLE_VERTICAL_AND_SINGLE_HORIZONTAL=197]="BOX_SINGLE_VERTICAL_AND_SINGLE_HORIZONTAL",t[t.BOX_DOUBLE_UP_AND_DOUBLE_RIGHT=200]="BOX_DOUBLE_UP_AND_DOUBLE_RIGHT",t[t.BOX_DOUBLE_DOWN_AND_DOUBLE_RIGHT=201]="BOX_DOUBLE_DOWN_AND_DOUBLE_RIGHT",t[t.BOX_DOUBLE_HORIZONTAL_AND_DOUBLE_UP=202]="BOX_DOUBLE_HORIZONTAL_AND_DOUBLE_UP",t[t.BOX_DOUBLE_HORIZONTAL_AND_DOUBLE_DOWN=203]="BOX_DOUBLE_HORIZONTAL_AND_DOUBLE_DOWN",t[t.BOX_DOUBLE_VERTICAL_AND_DOUBLE_RIGHT=204]="BOX_DOUBLE_VERTICAL_AND_DOUBLE_RIGHT",t[t.BOX_DOUBLE_HORIZONTAL=205]="BOX_DOUBLE_HORIZONTAL",t[t.BOX_DOUBLE_VERTICAL_AND_DOUBLE_HORIZONTAL=206]="BOX_DOUBLE_VERTICAL_AND_DOUBLE_HORIZONTAL",t[t.BOX_SINGLE_UP_AND_SINGLE_LEFT=217]="BOX_SINGLE_UP_AND_SINGLE_LEFT",t[t.BOX_SINGLE_DOWN_AND_SINGLE_RIGHT=218]="BOX_SINGLE_DOWN_AND_SINGLE_RIGHT",t[t.BLOCK_FULL=219]="BLOCK_FULL",t[t.BLOCK_BOTTOM_HALF=220]="BLOCK_BOTTOM_HALF",t[t.BLOCK_LEFT_HALF=221]="BLOCK_LEFT_HALF",t[t.BLOCK_RIGHT_HALF=222]="BLOCK_RIGHT_HALF",t[t.BLOCK_TOP_HALF=223]="BLOCK_TOP_HALF";}(c||(c={}));class K{constructor(t,i,e){u(this,"width",void 0),u(this,"height",void 0),u(this,"grid",void 0),u(this,"originX",void 0),u(this,"originY",void 0),u(this,"minX",void 0),u(this,"maxX",void 0),u(this,"minY",void 0),u(this,"maxY",void 0),u(this,"radius",void 0),this.width=t,this.height=i,this.grid=[],this.originX=0,this.originY=0,this.minX=0,this.maxX=0,this.minY=0,this.maxY=0,this.radius=0;for(let e=0;e<i;e++){const i=[];for(let s=0;s<t;s++)i.push(new E(s,e));this.grid.push(i);}if(this.clear(),e)for(let s=0;s<i;s++)for(let i=0;i<t;i++)this.grid[s][i].blocked=this.grid[s][i].blockedSight=e(i,s);}clear(){for(let t=0;t<this.height;t++)for(let i=0;i<this.width;i++)this.drawChar(i,t,0);}getCell(t,i){if(!(t<0||i<0||t>=this.width||i>=this.height))return this.grid[i][t]}getCharCode(t,i){if(!(t<0||i<0||t>=this.width||i>=this.height))return this.grid[i][t].charCode}drawChar(t,i,e,s,r){t>=0&&t<this.width&&i>=0&&i<this.height&&this.grid[0|i][0|t].setValue(e,s,r);}drawString(t,i,e,s,r){const h=e.split("\n");for(let e=0;e<h.length;e++){const o=h[e];for(let h=0;h<o.length;h++)this.drawChar(t+h,i+e,o.charCodeAt(h),s,r);}}drawCenteredString(t,i,e,s,r){this.drawString(t-Math.floor(e.length/2),i,e,s,r);}drawHLine(t,i,e,s,r,h){for(let o=t;o<t+e;o++)this.drawChar(o,i,s,r,h);}drawVLine(t,i,e,s,r,h){for(let o=i;o<i+e;o++)this.drawChar(t,o,s,r,h);}drawRect(t,i,e,s,r,h,o){this.drawHLine(t,i,e,r,h,o),this.drawHLine(t,i+s-1,e,r,h,o),this.drawVLine(t,i,s,r,h,o),this.drawVLine(t+e-1,i,s,r,h,o);}drawBox(t,i,e,s,r,h,o,n,_,a,d,A,l,E){this.fillRect(t,i,e,s,0,l,E),this.drawHLine(t,i,e,r),this.drawHLine(t,i+s-1,e,o),this.drawVLine(t,i,s,n),this.drawVLine(t+e-1,i,s,h),this.drawChar(t,i,_),this.drawChar(t+e-1,i,a),this.drawChar(t,i+s-1,A),this.drawChar(t+e-1,i+s-1,d);}drawSingleBox(t,i,e,s,r,h){this.drawBox(t,i,e,s,c.BOX_SINGLE_HORIZONTAL,c.BOX_SINGLE_VERTICAL,c.BOX_SINGLE_HORIZONTAL,c.BOX_SINGLE_VERTICAL,c.BOX_SINGLE_DOWN_AND_SINGLE_RIGHT,c.BOX_SINGLE_DOWN_AND_SINGLE_LEFT,c.BOX_SINGLE_UP_AND_SINGLE_LEFT,c.BOX_SINGLE_UP_AND_SINGLE_RIGHT,r,h);}drawDoubleBox(t,i,e,s,r,h){this.drawBox(t,i,e,s,c.BOX_DOUBLE_HORIZONTAL,c.BOX_DOUBLE_VERTICAL,c.BOX_DOUBLE_HORIZONTAL,c.BOX_DOUBLE_VERTICAL,c.BOX_DOUBLE_DOWN_AND_DOUBLE_RIGHT,c.BOX_DOUBLE_DOWN_AND_DOUBLE_LEFT,c.BOX_DOUBLE_UP_AND_DOUBLE_LEFT,c.BOX_DOUBLE_UP_AND_DOUBLE_RIGHT,r,h);}fillRect(t,i,e,s,r,h,o){for(let n=i;n<i+s;n++)this.drawHLine(t,n,e,r,h,o);}drawConsole(t,i,e,r,h,o,n,_){_=_||s.None;for(let s=0;s<n;s++)for(let n=0;n<o;n++){const o=e.getCell(r+n,h+s);o&&this.drawCell(t+n,i+s,o,_);}}drawCell(t,i,e,s){t>=0&&t<this.width&&i>=0&&i<this.height&&this.grid[i][t].drawCell(e,s);}setBlocked(t,i,e){t>=0&&t<this.width&&i>=0&&i<this.height&&(this.grid[i][t].blocked=e);}setBlockedSight(t,i,e){t>=0&&t<this.width&&i>=0&&i<this.height&&(this.grid[i][t].blockedSight=e);}isVisible(t,i){return !(t<this.minX||t>this.maxX||i<this.minY||i>this.maxY)&&this.grid[i][t].visible}isBlocked(t,i){return t<0||t>this.width||i<0||i>this.height||this.grid[i][t].blocked}isBlockedSight(t,i){return t<0||t>this.width||i<0||i>this.height||this.grid[i][t].blockedSight}computeOctantY(t,i){const e=[],s=[];let r,h,o,n,_,a,d,A,l,E,c=1,u=0,K=0,T=0;for(h=this.originY+i;h>=this.minY&&h<=this.maxY;h+=i,K=u,++c)for(o=.5/c,E=-1,n=Math.floor(T*c+.5),r=this.originX+n*t;n<=c&&r>=this.minX&&r<=this.maxX;r+=t,++n,E=l){if(_=!0,a=!1,d=n/c,A=E,l=d+o,K>0)if(this.grid[h-i][r].visible&&!this.grid[h-i][r].blockedSight||this.grid[h-i][r-t].visible&&!this.grid[h-i][r-t].blockedSight){for(let t=0;t<K&&_;++t)if(A<=s[t]&&l>=e[t])if(this.grid[h][r].blockedSight){if(A>=e[t]&&l<=s[t]){_=!1;break}e[t]=Math.min(e[t],A),s[t]=Math.max(s[t],l),a=!0;}else if(d>e[t]&&d<s[t]){_=!1;break}}else _=!1;_&&(this.grid[h][r].visible=!0,this.grid[h][r].blockedSight&&(T>=A?T=l:a||(e[u]=A,s[u++]=l)));}}computeOctantX(t,i){const e=[],s=[];let r,h,o,n,_,a,d,A,l,E,c=1,u=0,K=0,T=0;for(r=this.originX+t;r>=this.minX&&r<=this.maxX;r+=t,K=u,++c)for(o=.5/c,E=-1,n=Math.floor(T*c+.5),h=this.originY+n*i;n<=c&&h>=this.minY&&h<=this.maxY;h+=i,++n,E=l){if(_=!0,a=!1,d=n/c,A=E,l=d+o,K>0)if(this.grid[h][r-t].visible&&!this.grid[h][r-t].blockedSight||this.grid[h-i][r-t].visible&&!this.grid[h-i][r-t].blockedSight){for(let t=0;t<K&&_;++t)if(A<=s[t]&&l>=e[t])if(this.grid[h][r].blockedSight){if(A>=e[t]&&l<=s[t]){_=!1;break}e[t]=Math.min(e[t],A),s[t]=Math.max(s[t],l),a=!0;}else if(d>e[t]&&d<s[t]){_=!1;break}}else _=!1;_&&(this.grid[h][r].visible=!0,this.grid[h][r].blockedSight&&(T>=A?T=l:a||(e[u]=A,s[u++]=l)));}}computeFov(t,i,e,s,r){if(this.originX=t,this.originY=i,this.radius=e,s)this.minX=Math.min(this.minX,Math.max(0,t-e)),this.minY=Math.min(this.minY,Math.max(0,i-e)),this.maxX=Math.max(this.maxX,Math.min(this.width-1,t+e)),this.maxY=Math.max(this.maxY,Math.min(this.height-1,i+e));else {this.minX=Math.max(0,t-e),this.minY=Math.max(0,i-e),this.maxX=Math.min(this.width-1,t+e),this.maxY=Math.min(this.height-1,i+e);for(let t=this.minY;t<=this.maxY;t++)for(let i=this.minX;i<=this.maxX;i++)this.grid[t][i].visible=!1;}this.grid[i][t].visible=!0,void 0===r?(this.computeOctantY(1,1),this.computeOctantX(1,1),this.computeOctantX(1,-1),this.computeOctantY(1,-1),this.computeOctantY(-1,-1),this.computeOctantX(-1,-1),this.computeOctantX(-1,1),this.computeOctantY(-1,1)):(1&r&&this.computeOctantY(1,1),2&r&&this.computeOctantX(1,1),4&r&&this.computeOctantX(1,-1),8&r&&this.computeOctantY(1,-1),16&r&&this.computeOctantY(-1,-1),32&r&&this.computeOctantX(-1,-1),64&r&&this.computeOctantX(-1,1),128&r&&this.computeOctantY(-1,1));}updateExplored(){for(let t=this.minY;t<=this.maxY;t++)for(let i=this.minX;i<=this.maxX;i++){const e=this.grid[t][i];e.explored=e.explored||e.visible;}}}function T(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}class O{constructor(t,i,e,s,r){T(this,"url",void 0),T(this,"charWidth",void 0),T(this,"charHeight",void 0),T(this,"scale",void 0),T(this,"graphical",void 0),this.url=t,this.charWidth=i,this.charHeight=e,this.scale=s||1,this.graphical=!!r;}}const V=new O("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACAAQMAAAD58POIAAAABlBMVEUAAAD///+l2Z/dAAAEhklEQVRIx42Sv4oUQRDGC4UzadSwwMUD8QEKlbWD4Q58B/NGpTVocKO1wXHUzMAH0AcwMTYVGg5ag0IzEXaRjdZEZKNzkKbHqtnzHypY09M9+5uvqr7pbYCuC6ftaRhgONXs30eAh0O1rYDm4IS/eH0B8GxRW2vxo396yu/fb0ZFrW1zcOXlPU/XPwK8PGjbWhVwM4KnH61912oK4+zmmHJaQotyt1kvtC2Atdo24iohPDiG/v4eICJsY3Wy8Yvr0DSIBOdxgH6v8wsriWhc8s0AtaK/GzSl1jR0nSjQnwki6FQxNFKjgzO2a7BBqucH7dL4M9z96CIhT1Fs/AgKgcA6dKCxI29DaHNwRJ4EGAU1sU0OG9rmE4SIc3A4FChACqqhJRwpxkqh9wxag4DSmEJ5DtpFwAP4GUf6lmKcFFti1BYuQp4xN8kxM2kNhjdkTOiTUeAKGvhA1rLpMbYACQzCITlTDRMbLYoEa2JWPSMRFZIupcSzMVKcEUkX+sOG+ChNX2vD8ex6k7OFHL0P1655JuPd53WAD+yTv3UrCQiuHmYBbfIxpkImuvpBQBkVb5g4XHv3JkNireG8AO9zDhBZu2z2OMZ11S5/RIlyMefMNaZ4GsCz5xcjyM6hHYEjAYEfO8Ig1rklAe9sRIeYAdwyoIBq6YIzCAKiWoifA3m3o2AzWcdYKOdY47EIf8QABCuYgIUVmdVMEYEDA0Hmo/3D6KKJbh5mxhP3UsWIE97wnEygyizOfOLi2JOJW8CeOblW9IHeKZgv4zxuzDryOmb+4aQH+MXV6e0ywdUcxqCjBWl5GpbzZduOG1QEiGXP86T7EfiJfkMQ4OO4H0yqyNC2zlziWEN7Ywuc2fQ4p5BNkS5QYXP2h5NtRJh0vCKQidtVJmCGAwDSSQpYggSxiRIyzewsgCh4xxiTPDMh5aj//l7btqkr6rQyIOtLji4lVRQwXdzvus40Y53M33fh50GZwF4ExQeMlvuTggLzSi4ElKczUO7zVtpwdyMKdqZKOWb2nDblawPxPmuMwFEWBW+jlZR1eYtS442kiBGMWCi/h1/+GAR6NYOJWiqNJXFygFtrkx5C0O3IeFGs67HhEEhmBu/BUOT+0551pXxYIF+Elpi5AKRkLl5GUbCCZddyMv621ujEBPP4vSy2fotTx3U+d3WBiFOA6VSGSB49v/M7GBX9FPrDaT2c9qr4PCpwZ7qz813R94dVFIe19v33GlMZUghQFb8BrfE7QBmgBMbrn2B3enn/y3B5+DL8UBAdnejdYdBxeV9ejwoYNTgW0Ok/gA7UG2GAzanhL0DG7q4svynwF8UwDPu7u/vD0IudzSltMtVbP+J/gUbR29oJ7Fg9s6Uy+DnpiTCOYc4cXOeXMWfsusSw7FOg9x655nax6BlecwpOQQ68WBwp+H2LMQTuOq2RUigzh2Q/R3CWARJIJG199EwOTyKBlQMznshCRGeQ5gHABAQl6M4gLEdAzVaBWMCiANdsayDCHBA/hagKYfielrJIlipKKQIA9Nf3wBloTHT6BuAx15zRNa1nAAAAAElFTkSuQmCC",8,8);let g,N;function L(t,i){return t>0?i>0?N.QUADRANT_SOUTHEAST:0===i?N.QUADRANT_EAST:N.QUADRANT_NORTHEAST:t<0?i>0?N.QUADRANT_SOUTHWEST:0===i?N.QUADRANT_WEST:N.QUADRANT_NORTHWEST:i>0?N.QUADRANT_SOUTH:N.QUADRANT_NORTH}function f(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}!function(t){t[t.OCTANT_SOUTH_SOUTHEAST=1]="OCTANT_SOUTH_SOUTHEAST",t[t.OCTANT_EAST_SOUTHEAST=2]="OCTANT_EAST_SOUTHEAST",t[t.OCTANT_EAST_NORTHTHEAST=4]="OCTANT_EAST_NORTHTHEAST",t[t.OCTANT_NORTH_NORTHEAST=8]="OCTANT_NORTH_NORTHEAST",t[t.OCTANT_NORTH_NORTHWEST=16]="OCTANT_NORTH_NORTHWEST",t[t.OCTANT_WEST_NORTHEAST=32]="OCTANT_WEST_NORTHEAST",t[t.OCTANT_WEST_SOUTHWEST=64]="OCTANT_WEST_SOUTHWEST",t[t.OCTANT_SOUTH_SOUTHWEST=128]="OCTANT_SOUTH_SOUTHWEST";}(g||(g={})),function(t){t[t.QUADRANT_SOUTHEAST=3]="QUADRANT_SOUTHEAST",t[t.QUADRANT_EAST=6]="QUADRANT_EAST",t[t.QUADRANT_NORTHEAST=12]="QUADRANT_NORTHEAST",t[t.QUADRANT_NORTH=24]="QUADRANT_NORTH",t[t.QUADRANT_NORTHWEST=48]="QUADRANT_NORTHWEST",t[t.QUADRANT_WEST=96]="QUADRANT_WEST",t[t.QUADRANT_SOUTHWEST=192]="QUADRANT_SOUTHWEST",t[t.QUADRANT_SOUTH=129]="QUADRANT_SOUTH";}(N||(N={}));class R{constructor(t,i){f(this,"x",void 0),f(this,"y",void 0),this.x=t,this.y=i;}}function D(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}class C{constructor(t,i,e,s){D(this,"x",void 0),D(this,"y",void 0),D(this,"width",void 0),D(this,"height",void 0),D(this,"left",void 0),D(this,"top",void 0),D(this,"x2",void 0),D(this,"y2",void 0),this.x=this.left=t,this.y=this.top=i,this.width=e,this.height=s,this.x2=t+e,this.y2=i+s;}getCenter(){return new R(this.x+this.width/2|0,this.y+this.height/2|0)}intersects(t){return this.x<=t.x2&&this.x2>=t.x&&this.y<=t.y2&&this.y2>=t.y}contains(t){return t.x>=this.x&&t.x<this.x2&&t.y>=this.y&&t.y<this.y2}}function U(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}class S{constructor(t,i,e){U(this,"dialog",void 0),U(this,"rect",void 0),U(this,"contentsOffset",void 0),U(this,"open",void 0),U(this,"count",void 0),U(this,"buffer",void 0),this.dialog=t,this.rect=i,this.contentsOffset=e,this.open=!1,this.count=0;}}class v{getState(t,i){const e=i.contentsRect.width+4,s=i.contentsRect.height+4,r=(t.width-e)/2|0,h=(t.height-s)/2|0;return new S(i,new C(r,h,e,s),new R(r+2,h+2))}draw(t,i){const e=i.dialog,{x:s,y:r,width:h,height:o}=i.rect;t.fillRect(s,r,h,o,0,A.WHITE,A.BLACK),t.drawSingleBox(s,r,h,o),t.drawCenteredString(s+h/2|0,r," "+e.title+" "),e.drawContents(t,i.contentsOffset);}}function B(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}class I{constructor(t,i){B(this,"terminal",void 0),B(this,"renderer",void 0),B(this,"dialogs",void 0),this.terminal=t,this.renderer=i||new v,this.dialogs=[];}add(t){this.dialogs.push(this.renderer.getState(this.terminal,t));}handleInput(){if(0===this.dialogs.length)return !1;const t=this.dialogs.length-1,i=this.dialogs[this.dialogs.length-1];return i.dialog.handleInput(this.terminal,i.contentsOffset)&&this.dialogs.splice(t,1),!0}draw(){for(let t=0;t<this.dialogs.length;t++)this.renderer.draw(this.terminal,this.dialogs[t]);}}function p(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}class b{constructor(t,i){p(this,"contentsRect",void 0),p(this,"title",void 0),this.contentsRect=t,this.title=i;}}function w(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}class y{constructor(){w(this,"down",void 0),w(this,"downTime",void 0),w(this,"repeat",void 0),w(this,"repeatTime",void 0),w(this,"downCount",void 0),w(this,"upCount",void 0),this.down=!1,this.downTime=0,this.repeat=!1,this.repeatTime=0,this.downCount=0,this.upCount=100;}setDown(t){this.down!==t&&(this.down=t,this.repeat=!1,this.downTime=this.repeatTime=performance.now());}update(t){this.repeat=!1,this.down?(this.downCount++,this.upCount=0,t-this.downTime>=200&&t-this.repeatTime>=66.66666666666667&&(this.repeat=!0,this.repeatTime=t)):(this.downCount=0,this.upCount++);}isPressed(){return 1===this.downCount||this.repeat}isClicked(){return 1===this.upCount}}const m=256;class x{constructor(t){var i,e,s;s=void 0,(e="keys")in(i=this)?Object.defineProperty(i,e,{value:s,enumerable:!0,configurable:!0,writable:!0}):i[e]=s,this.keys=new Array(m);for(let t=0;t<m;t++)this.keys[t]=new y;t.addEventListener("keydown",(t=>this.setKey(t,!0))),t.addEventListener("keyup",(t=>this.setKey(t,!1)));}setKey(t,i){const e=t.keyCode;e!==P.VK_F11&&(t.stopPropagation(),t.preventDefault(),e>=0&&e<m&&this.keys[e].setDown(i));}updateKeys(t){for(let i=0;i<m;i++)this.keys[i].update(t);}getKey(t){return t>=0&&t<m?this.keys[t]:null}}let P;!function(t){t[t.VK_CANCEL=3]="VK_CANCEL",t[t.VK_HELP=6]="VK_HELP",t[t.VK_BACK_SPACE=8]="VK_BACK_SPACE",t[t.VK_TAB=9]="VK_TAB",t[t.VK_CLEAR=12]="VK_CLEAR",t[t.VK_ENTER=13]="VK_ENTER",t[t.VK_SHIFT=16]="VK_SHIFT",t[t.VK_CONTROL=17]="VK_CONTROL",t[t.VK_ALT=18]="VK_ALT",t[t.VK_PAUSE=19]="VK_PAUSE",t[t.VK_CAPS_LOCK=20]="VK_CAPS_LOCK",t[t.VK_ESCAPE=27]="VK_ESCAPE",t[t.VK_SPACE=32]="VK_SPACE",t[t.VK_PAGE_UP=33]="VK_PAGE_UP",t[t.VK_PAGE_DOWN=34]="VK_PAGE_DOWN",t[t.VK_END=35]="VK_END",t[t.VK_HOME=36]="VK_HOME",t[t.VK_LEFT=37]="VK_LEFT",t[t.VK_UP=38]="VK_UP",t[t.VK_RIGHT=39]="VK_RIGHT",t[t.VK_DOWN=40]="VK_DOWN",t[t.VK_PRINTSCREEN=44]="VK_PRINTSCREEN",t[t.VK_INSERT=45]="VK_INSERT",t[t.VK_DELETE=46]="VK_DELETE",t[t.VK_0=48]="VK_0",t[t.VK_1=49]="VK_1",t[t.VK_2=50]="VK_2",t[t.VK_3=51]="VK_3",t[t.VK_4=52]="VK_4",t[t.VK_5=53]="VK_5",t[t.VK_6=54]="VK_6",t[t.VK_7=55]="VK_7",t[t.VK_8=56]="VK_8",t[t.VK_9=57]="VK_9",t[t.VK_COLON=58]="VK_COLON",t[t.VK_SEMICOLON=59]="VK_SEMICOLON",t[t.VK_LESS_THAN=60]="VK_LESS_THAN",t[t.VK_EQUALS=61]="VK_EQUALS",t[t.VK_GREATER_THAN=62]="VK_GREATER_THAN",t[t.VK_QUESTION_MARK=63]="VK_QUESTION_MARK",t[t.VK_AT=64]="VK_AT",t[t.VK_A=65]="VK_A",t[t.VK_B=66]="VK_B",t[t.VK_C=67]="VK_C",t[t.VK_D=68]="VK_D",t[t.VK_E=69]="VK_E",t[t.VK_F=70]="VK_F",t[t.VK_G=71]="VK_G",t[t.VK_H=72]="VK_H",t[t.VK_I=73]="VK_I",t[t.VK_J=74]="VK_J",t[t.VK_K=75]="VK_K",t[t.VK_L=76]="VK_L",t[t.VK_M=77]="VK_M",t[t.VK_N=78]="VK_N",t[t.VK_O=79]="VK_O",t[t.VK_P=80]="VK_P",t[t.VK_Q=81]="VK_Q",t[t.VK_R=82]="VK_R",t[t.VK_S=83]="VK_S",t[t.VK_T=84]="VK_T",t[t.VK_U=85]="VK_U",t[t.VK_V=86]="VK_V",t[t.VK_W=87]="VK_W",t[t.VK_X=88]="VK_X",t[t.VK_Y=89]="VK_Y",t[t.VK_Z=90]="VK_Z",t[t.VK_CONTEXT_MENU=93]="VK_CONTEXT_MENU",t[t.VK_NUMPAD0=96]="VK_NUMPAD0",t[t.VK_NUMPAD1=97]="VK_NUMPAD1",t[t.VK_NUMPAD2=98]="VK_NUMPAD2",t[t.VK_NUMPAD3=99]="VK_NUMPAD3",t[t.VK_NUMPAD4=100]="VK_NUMPAD4",t[t.VK_NUMPAD5=101]="VK_NUMPAD5",t[t.VK_NUMPAD6=102]="VK_NUMPAD6",t[t.VK_NUMPAD7=103]="VK_NUMPAD7",t[t.VK_NUMPAD8=104]="VK_NUMPAD8",t[t.VK_NUMPAD9=105]="VK_NUMPAD9",t[t.VK_MULTIPLY=106]="VK_MULTIPLY",t[t.VK_ADD=107]="VK_ADD",t[t.VK_SEPARATOR=108]="VK_SEPARATOR",t[t.VK_SUBTRACT=109]="VK_SUBTRACT",t[t.VK_DECIMAL=110]="VK_DECIMAL",t[t.VK_DIVIDE=111]="VK_DIVIDE",t[t.VK_F1=112]="VK_F1",t[t.VK_F2=113]="VK_F2",t[t.VK_F3=114]="VK_F3",t[t.VK_F4=115]="VK_F4",t[t.VK_F5=116]="VK_F5",t[t.VK_F6=117]="VK_F6",t[t.VK_F7=118]="VK_F7",t[t.VK_F8=119]="VK_F8",t[t.VK_F9=120]="VK_F9",t[t.VK_F10=121]="VK_F10",t[t.VK_F11=122]="VK_F11",t[t.VK_F12=123]="VK_F12",t[t.VK_F13=124]="VK_F13",t[t.VK_F14=125]="VK_F14",t[t.VK_F15=126]="VK_F15",t[t.VK_F16=127]="VK_F16",t[t.VK_F17=128]="VK_F17",t[t.VK_F18=129]="VK_F18",t[t.VK_F19=130]="VK_F19",t[t.VK_F20=131]="VK_F20",t[t.VK_F21=132]="VK_F21",t[t.VK_F22=133]="VK_F22",t[t.VK_F23=134]="VK_F23",t[t.VK_F24=135]="VK_F24",t[t.VK_NUM_LOCK=144]="VK_NUM_LOCK",t[t.VK_SCROLL_LOCK=145]="VK_SCROLL_LOCK",t[t.VK_CIRCUMFLEX=160]="VK_CIRCUMFLEX",t[t.VK_EXCLAMATION=161]="VK_EXCLAMATION",t[t.VK_DOUBLE_QUOTE=162]="VK_DOUBLE_QUOTE",t[t.VK_HASH=163]="VK_HASH",t[t.VK_DOLLAR=164]="VK_DOLLAR",t[t.VK_PERCENT=165]="VK_PERCENT",t[t.VK_AMPERSAND=166]="VK_AMPERSAND",t[t.VK_UNDERSCORE=167]="VK_UNDERSCORE",t[t.VK_OPEN_PAREN=168]="VK_OPEN_PAREN",t[t.VK_CLOSE_PAREN=169]="VK_CLOSE_PAREN",t[t.VK_ASTERISK=170]="VK_ASTERISK",t[t.VK_PLUS=171]="VK_PLUS",t[t.VK_PIPE=172]="VK_PIPE",t[t.VK_HYPHEN_MINUS=173]="VK_HYPHEN_MINUS",t[t.VK_OPEN_CURLY_BRACKET=174]="VK_OPEN_CURLY_BRACKET",t[t.VK_CLOSE_CURLY_BRACKET=175]="VK_CLOSE_CURLY_BRACKET",t[t.VK_TILDE=176]="VK_TILDE",t[t.VK_COMMA=188]="VK_COMMA",t[t.VK_PERIOD=190]="VK_PERIOD",t[t.VK_SLASH=191]="VK_SLASH",t[t.VK_BACK_QUOTE=192]="VK_BACK_QUOTE",t[t.VK_OPEN_BRACKET=219]="VK_OPEN_BRACKET",t[t.VK_BACK_SLASH=220]="VK_BACK_SLASH",t[t.VK_CLOSE_BRACKET=221]="VK_CLOSE_BRACKET",t[t.VK_QUOTE=222]="VK_QUOTE",t[t.VK_META=224]="VK_META",t[t.VK_ALTGR=225]="VK_ALTGR",t[t.VK_WIN=91]="VK_WIN",t[t.VK_KANA=21]="VK_KANA",t[t.VK_HANGUL=21]="VK_HANGUL",t[t.VK_EISU=22]="VK_EISU",t[t.VK_JUNJA=23]="VK_JUNJA",t[t.VK_FINAL=24]="VK_FINAL",t[t.VK_HANJA=25]="VK_HANJA",t[t.VK_KANJI=25]="VK_KANJI",t[t.VK_CONVERT=28]="VK_CONVERT",t[t.VK_NONCONVERT=29]="VK_NONCONVERT",t[t.VK_ACCEPT=30]="VK_ACCEPT",t[t.VK_MODECHANGE=31]="VK_MODECHANGE",t[t.VK_SELECT=41]="VK_SELECT",t[t.VK_PRINT=42]="VK_PRINT",t[t.VK_EXECUTE=43]="VK_EXECUTE",t[t.VK_SLEEP=95]="VK_SLEEP";}(P||(P={}));class H extends b{constructor(t,i){const e=i.split("\n");let s=t.length;for(let t=0;t<e.length;t++)s=Math.max(s,e[t].length);const r=e.length;var h,o,n;super(new C(0,0,s,r),t),n=void 0,(o="lines")in(h=this)?Object.defineProperty(h,o,{value:n,enumerable:!0,configurable:!0,writable:!0}):h[o]=n,this.lines=e;}drawContents(t,i){for(let e=0;e<this.lines.length;e++)t.drawString(i.x,i.y+e,this.lines[e]);}handleInput(t,i){return t.isKeyPressed(P.VK_ESCAPE)}}function F(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}class M extends b{constructor(t,i,e){let s=t.length;for(let t=0;t<i.length;t++)s=Math.max(s,i[t].length+4);const r=i.length;super(new C(0,0,s,r),t),F(this,"options",void 0),F(this,"callback",void 0),F(this,"hoverIndex",void 0),this.options=i,this.callback=e,this.hoverIndex=-1;}drawContents(t,i){for(let e=0;e<this.options.length;e++){const s=String.fromCharCode(65+e)+" - "+this.options[e];e===this.hoverIndex?t.drawString(i.x,i.y+e,s,A.BLACK,A.WHITE):t.drawString(i.x,i.y+e,s,A.WHITE,A.BLACK);}}handleInput(t,i){if(this.hoverIndex=-1,t.mouse.x>=i.x&&t.mouse.x<i.x+this.contentsRect.width&&t.mouse.y>=i.y&&t.mouse.y<i.y+this.contentsRect.height&&(this.hoverIndex=t.mouse.y-i.y,1===t.mouse.buttons[0].upCount))return this.callback(this.hoverIndex),!0;for(let i=0;i<this.options.length;i++)if(t.isKeyPressed(P.VK_A+i))return this.callback(i),!0;return t.isKeyPressed(P.VK_ESCAPE)}isMouseOverOption(t,i,e){return t.mouse.x>=i.x&&t.mouse.x<i.x+this.contentsRect.width&&t.mouse.y===i.y+e}}const G=[{charCode:c.BLOCK_TOP_HALF,active:[1,1,0,0]},{charCode:c.BLOCK_RIGHT_HALF,active:[0,1,0,1]}];function X(t,i){const e=new Image;e.onload=()=>{const t=e.width,s=e.height,r=W(e),h=new K(t,s);let o=0;for(let i=0;i<s;i++)for(let e=0;e<t;e++){h.getCell(e,i).setBackground(a(r[o++],r[o++],r[o++],r[o++]));}i(h);},e.src=t;}function Y(t,i){const e=new Image;e.onload=()=>{const t=e.width,s=e.height,r=W(e),h=new K(t/2,s/2);for(let i=0;i<s;i+=2)for(let e=0;e<t;e+=2)k(h,r,e,i,t);i(h);},e.src=t;}function W(t){const i=document.createElement("canvas");i.width=t.width,i.height=t.height;const e=i.getContext("2d");return e.drawImage(t,0,0),e.getImageData(0,0,t.width,t.height).data}function k(t,i,e,s,r){const h=4*(s*r+e),o=4*(s*r+e+1),n=4*((s+1)*r+e),_=4*((s+1)*r+e+1),a=[[i[h],i[h+1],i[h+2]],[i[o],i[o+1],i[o+2]],[i[n],i[n+1],i[n+2]],[i[_],i[_+1],i[_+2]]];let d=Number.MAX_VALUE,A=0,l=null,E=null;for(let t=0;t<G.length;t++){const i=G[t],e=Q(i.active,a);e.error<d&&(d=e.error,A=i.charCode,l=e.bg,E=e.fg);}t.drawChar(e/2,s/2,A,z(E),z(l));}function Q(t,i){const e=[[0,0,0],[0,0,0]],s=[[0,0,0],[0,0,0]],r=[0,0];for(let s=0;s<4;s++){for(let r=0;r<3;r++)e[t[s]][r]+=i[s][r];r[t[s]]++;}for(let t=0;t<2;t++)for(let i=0;i<3;i++)s[t][i]=e[t][i]/r[t];let h=0;for(let e=0;e<4;e++){let r=0;for(let h=0;h<3;h++){const o=i[e][h]-s[t[e]][h];r+=o*o;}h+=Math.sqrt(r);}return {bg:s[0],fg:s[1],error:h}}function z(t){return a(t[0],t[1],t[2])}function j(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}class Z{constructor(t){j(this,"el",void 0),j(this,"width",void 0),j(this,"height",void 0),j(this,"prevX",void 0),j(this,"prevY",void 0),j(this,"x",void 0),j(this,"y",void 0),j(this,"dx",void 0),j(this,"dy",void 0),j(this,"buttons",void 0),this.el=t.canvas,this.width=t.width,this.height=t.height,this.prevX=0,this.prevY=0,this.x=0,this.y=0,this.dx=0,this.dy=0,this.buttons=[new y,new y,new y];const i=this.el;i.addEventListener("mousedown",(t=>this.handleEvent(t))),i.addEventListener("mouseup",(t=>this.handleEvent(t))),i.addEventListener("mousemove",(t=>this.handleEvent(t))),i.addEventListener("contextmenu",(t=>this.handleEvent(t)));const e=this.handleTouchEvent.bind(this);i.addEventListener("touchstart",e),i.addEventListener("touchend",e),i.addEventListener("touchcancel",e),i.addEventListener("touchmove",e);}handleTouchEvent(t){if(t.stopPropagation(),t.preventDefault(),t.touches.length>0){const i=t.touches[0];this.updatePosition(i.clientX,i.clientY),this.buttons[0].setDown(!0);}else this.buttons[0].setDown(!1);}handleEvent(t){t.stopPropagation(),t.preventDefault(),this.updatePosition(t.clientX,t.clientY),"mousedown"===t.type&&(this.buttons[t.button].setDown(!0),this.el.focus()),"mouseup"===t.type&&this.buttons[t.button].setDown(!1);}updatePosition(t,i){let e=this.el.getBoundingClientRect();const s=this.width/this.height,r=e.width/e.height;if(r-s>.01){const t=s*e.height,i=e.width-t;e=new C(Math.floor(i/2),0,t,e.height);}if(r-s<-.01){const t=e.width/s,i=e.height-t;e=new C(0,Math.floor(i/2),e.width,t);}this.x=this.width*(t-e.left)/e.width|0,this.y=this.height*(i-e.top)/e.height|0;}update(t){this.dx=this.x-this.prevX,this.dy=this.y-this.prevY,this.prevX=this.x,this.prevY=this.y;for(let i=0;i<this.buttons.length;i++)this.buttons[i].update(t);}}const J=[-1,0,1,-1,1,-1,0,1],q=[-1,-1,-1,0,0,1,1,1],$=[1.4,1,1.4,1,1,1.4,1,1.4];let tt=0;function it(t,i,e,s){tt++;const r=t.grid[i.y][i.x];r.pathId=tt,r.g=0,r.h=Math.hypot(i.x-e.x,i.y-e.y),r.prev=null;const h=new st([r]);for(;h.size()>0;){const i=h.pop();if(i.x===e.x&&i.y===e.y)return et(i);for(let r=0;r<J.length;r++){const o=i.x+J[r],n=i.y+q[r];if(o>=0&&o<t.width&&n>=0&&n<t.height){const _=t.grid[n][o];if(_.blocked&&_.explored&&(o!==e.x||n!==e.y))continue;_.pathId!==tt&&(_.pathId=tt,_.g=1/0,_.h=Math.hypot(o-e.x,n-e.y),_.prev=null);const a=i.g+$[r];a<_.g&&a<=s&&(_.g=a,_.prev=i,h.insert(_));}}}}function et(t){const i=[];let e=t;for(;e;)i.push(e),e=e.prev;return i.reverse(),i}class st{constructor(t){var i,e,s;s=void 0,(e="values")in(i=this)?Object.defineProperty(i,e,{value:s,enumerable:!0,configurable:!0,writable:!0}):i[e]=s,this.values=t;}insert(t){const i=this.values;let e=0,s=i.length,r=0;for(;e<s;){const h=e+s>>>1,o=i[h];o.g+o.h>t.g+t.h?(e=h+1,r=e):(s=h,r=s);}i.splice(r,0,t);}pop(){return this.values.pop()}size(){return this.values.length}}function rt(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}class ht{constructor(t){rt(this,"m",void 0),rt(this,"a",void 0),rt(this,"c",void 0),rt(this,"state",void 0),this.m=2147483648,this.a=1103515245,this.c=12345,this.state=t||1;}nextInt(){return this.state=(this.a*this.state+this.c)%this.m,this.state}nextFloat(){return this.nextInt()/(this.m-1)}nextRange(t,i){const e=i-t,s=t+(this.nextInt()/this.m*e|0);if(isNaN(s))throw new Error("rand nan");return s}chooseIndex(t){const i=t.reduce(((t,i)=>t+i)),e=this.nextRange(1,i+1);let s=0;for(let i=0;i<t.length;i++)if(s+=t[i],e<=s)return i;return t.length-1}chooseKey(t){const i=Object.keys(t),e=i.map((i=>t[i]));return i[this.chooseIndex(e)]}}function ot(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}function nt(t,i){return t/i*2-1}const _t={font:V};class at extends K{constructor(t,i,e,s){super(i,e),ot(this,"canvas",void 0),ot(this,"font",void 0),ot(this,"pixelWidth",void 0),ot(this,"pixelHeight",void 0),ot(this,"keys",void 0),ot(this,"mouse",void 0),ot(this,"gl",void 0),ot(this,"program",void 0),ot(this,"positionAttribLocation",void 0),ot(this,"textureAttribLocation",void 0),ot(this,"fgColorAttribLocation",void 0),ot(this,"bgColorAttribLocation",void 0),ot(this,"positionsArray",void 0),ot(this,"indexArray",void 0),ot(this,"textureArray",void 0),ot(this,"foregroundUint8Array",void 0),ot(this,"foregroundDataView",void 0),ot(this,"backgroundUint8Array",void 0),ot(this,"backgroundDataView",void 0),ot(this,"positionBuffer",void 0),ot(this,"indexBuffer",void 0),ot(this,"textureBuffer",void 0),ot(this,"foregroundBuffer",void 0),ot(this,"backgroundBuffer",void 0),ot(this,"texture",void 0),ot(this,"lastRenderTime",void 0),ot(this,"renderDelta",void 0),ot(this,"fps",void 0),ot(this,"averageFps",void 0),ot(this,"update",void 0),s=s||_t,this.canvas=t,this.font=s.font||V,this.pixelWidth=i*this.font.charWidth,this.pixelHeight=e*this.font.charHeight,t.width=this.pixelWidth,t.height=this.pixelHeight,t.style.imageRendering="pixelated",t.style.outline="none",t.tabIndex=0,this.handleResize(),window.addEventListener("resize",(()=>this.handleResize())),this.keys=new x(t),this.mouse=new Z(this);const r=t.getContext("webgl",{antialias:!1});if(!r)throw new Error("Unable to initialize WebGL. Your browser may not support it.");const h=r.createProgram();if(!h)throw new Error("Unable to initialize WebGL. Your browser may not support it.");this.gl=r,this.program=h,r.attachShader(h,this.buildShader(r.VERTEX_SHADER,"attribute vec2 a;attribute vec2 b;attribute vec3 c;attribute vec3 d;varying highp vec2 e;varying highp vec4 f;varying highp vec4 g;void main(void){gl_Position=vec4(a.x,a.y,0,1);e=b/16.0;f=vec4(c.r,c.g,c.b,1);g=vec4(d.r,d.g,d.b,1);}")),r.attachShader(h,this.buildShader(r.FRAGMENT_SHADER,"varying highp vec2 e;varying highp vec4 f;varying highp vec4 g;uniform bool h;uniform sampler2D s;void main(void){gl_FragColor=texture2D(s,e);if(h){if(gl_FragColor.a<0.1){gl_FragColor=texture2D(s,g.rg*16.0+fract(e*16.0)/16.0);}}else{if(gl_FragColor.r<0.1) {gl_FragColor=g;} else {gl_FragColor=f;}}}")),r.linkProgram(h),r.useProgram(h),this.font.graphical&&r.uniform1i(r.getUniformLocation(h,"h"),1),this.positionAttribLocation=this.getAttribLocation("a"),this.textureAttribLocation=this.getAttribLocation("b"),this.fgColorAttribLocation=this.getAttribLocation("c"),this.bgColorAttribLocation=this.getAttribLocation("d");const o=i*e;this.positionsArray=new Float32Array(3*o*4),this.indexArray=new Uint16Array(6*o),this.textureArray=new Float32Array(2*o*4),this.foregroundUint8Array=new Uint8Array(4*o*4),this.foregroundDataView=new DataView(this.foregroundUint8Array.buffer),this.backgroundUint8Array=new Uint8Array(4*o*4),this.backgroundDataView=new DataView(this.backgroundUint8Array.buffer);let n=0,_=0,a=0;for(let t=0;t<e;t++)for(let s=0;s<i;s++)this.positionsArray[n++]=nt(s,i),this.positionsArray[n++]=-nt(t,e),this.positionsArray[n++]=nt(s+1,i),this.positionsArray[n++]=-nt(t,e),this.positionsArray[n++]=nt(s+1,i),this.positionsArray[n++]=-nt(t+1,e),this.positionsArray[n++]=nt(s,i),this.positionsArray[n++]=-nt(t+1,e),this.indexArray[_++]=a+0,this.indexArray[_++]=a+1,this.indexArray[_++]=a+2,this.indexArray[_++]=a+0,this.indexArray[_++]=a+2,this.indexArray[_++]=a+3,a+=4;this.positionBuffer=r.createBuffer(),this.indexBuffer=r.createBuffer(),this.textureBuffer=r.createBuffer(),this.foregroundBuffer=r.createBuffer(),this.backgroundBuffer=r.createBuffer(),r.bindBuffer(r.ARRAY_BUFFER,this.positionBuffer),r.bufferData(r.ARRAY_BUFFER,this.positionsArray,r.STATIC_DRAW),r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,this.indexBuffer),r.bufferData(r.ELEMENT_ARRAY_BUFFER,this.indexArray,r.STATIC_DRAW),this.texture=this.loadTexture(this.font.url),this.lastRenderTime=0,this.renderDelta=0,this.fps=0,this.averageFps=0,this.requestAnimationFrame();}handleResize(){const t=this.canvas.parentElement;if(!t)return;const i=t.offsetWidth/this.pixelWidth,e=t.offsetHeight/this.pixelHeight,s=Math.min(i,e),r=s*this.pixelWidth|0,h=s*this.pixelHeight|0;this.canvas.style.width=r+"px",this.canvas.style.height=h+"px";}getAttribLocation(t){const i=this.gl.getAttribLocation(this.program,t);return this.gl.enableVertexAttribArray(i),i}flush(){let t=0,i=0;for(let e=0;e<this.height;e++)for(let s=0;s<this.width;s++){const r=this.getCell(s,e);if(!r.dirty){t+=8,i+=16;continue}const h=r.charCode%16,o=r.charCode/16|0;this.textureArray[t++]=h,this.textureArray[t++]=o,this.textureArray[t++]=h+1,this.textureArray[t++]=o,this.textureArray[t++]=h+1,this.textureArray[t++]=o+1,this.textureArray[t++]=h,this.textureArray[t++]=o+1;for(let t=0;t<4;t++)this.foregroundDataView.setUint32(i,r.fg,!1),this.backgroundDataView.setUint32(i,r.bg,!1),i+=4;r.dirty=!1;}}isKeyDown(t){const i=this.keys.getKey(t);return !!i&&i.down}isKeyPressed(t){const i=this.keys.getKey(t);return !!i&&i.isPressed()}getKeyDownCount(t){const i=this.keys.getKey(t);return i?i.downCount:0}getMovementKey(){return this.isKeyPressed(P.VK_NUMPAD1)||this.isKeyPressed(P.VK_B)?new R(-1,1):this.isKeyPressed(P.VK_NUMPAD2)||this.isKeyPressed(P.VK_J)||this.isKeyPressed(P.VK_DOWN)?new R(0,1):this.isKeyPressed(P.VK_NUMPAD3)||this.isKeyPressed(P.VK_N)?new R(1,1):this.isKeyPressed(P.VK_NUMPAD4)||this.isKeyPressed(P.VK_H)||this.isKeyPressed(P.VK_LEFT)?new R(-1,0):this.isKeyPressed(P.VK_NUMPAD5)||this.isKeyPressed(P.VK_PERIOD)?new R(0,0):this.isKeyPressed(P.VK_NUMPAD6)||this.isKeyPressed(P.VK_L)||this.isKeyPressed(P.VK_RIGHT)?new R(1,0):this.isKeyPressed(P.VK_NUMPAD7)||this.isKeyPressed(P.VK_Y)?new R(-1,-1):this.isKeyPressed(P.VK_NUMPAD8)||this.isKeyPressed(P.VK_K)||this.isKeyPressed(P.VK_DOWN)?new R(0,-1):this.isKeyPressed(P.VK_NUMPAD9)||this.isKeyPressed(P.VK_U)?new R(1,-1):void 0}buildShader(t,i){const e=this.gl,s=e.createShader(t);if(!s)throw new Error("An error occurred compiling the shader: ");if(e.shaderSource(s,i),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS))throw new Error("An error occurred compiling the shader: "+e.getShaderInfoLog(s));return s}loadTexture(t){const i=this.gl,e=i.createTexture();i.bindTexture(i.TEXTURE_2D,e);const s=i.RGBA,r=i.RGBA,h=i.UNSIGNED_BYTE,o=new Uint8Array([0,0,0,255]);i.texImage2D(i.TEXTURE_2D,0,s,1,1,0,r,h,o);const n=new Image;return n.onload=()=>{i.bindTexture(i.TEXTURE_2D,e),i.texImage2D(i.TEXTURE_2D,0,s,r,h,n),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MAG_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR);},n.src=t,e}render(){const t=this.gl;t.clearColor(0,0,0,1),t.clearDepth(1),t.clear(t.COLOR_BUFFER_BIT|t.DEPTH_BUFFER_BIT),t.viewport(0,0,this.pixelWidth,this.pixelHeight);{const i=2,e=t.FLOAT,s=!1,r=0,h=0;t.bindBuffer(t.ARRAY_BUFFER,this.positionBuffer),t.vertexAttribPointer(this.positionAttribLocation,i,e,s,r,h);}{const i=2,e=t.FLOAT,s=!1,r=0,h=0;t.bindBuffer(t.ARRAY_BUFFER,this.textureBuffer),t.bufferData(t.ARRAY_BUFFER,this.textureArray,t.DYNAMIC_DRAW),t.vertexAttribPointer(this.textureAttribLocation,i,e,s,r,h);}{const i=4,e=t.UNSIGNED_BYTE,s=!0,r=0,h=0;t.bindBuffer(t.ARRAY_BUFFER,this.foregroundBuffer),t.bufferData(t.ARRAY_BUFFER,this.foregroundUint8Array,t.DYNAMIC_DRAW),t.vertexAttribPointer(this.fgColorAttribLocation,i,e,s,r,h);}{const i=4,e=t.UNSIGNED_BYTE,s=!0,r=0,h=0;t.bindBuffer(t.ARRAY_BUFFER,this.backgroundBuffer),t.bufferData(t.ARRAY_BUFFER,this.backgroundUint8Array,t.DYNAMIC_DRAW),t.vertexAttribPointer(this.bgColorAttribLocation,i,e,s,r,h);}t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.indexBuffer),t.useProgram(this.program),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.texture);{const i=this.width*this.height*6,e=t.UNSIGNED_SHORT,s=0;t.drawElements(t.TRIANGLES,i,e,s);}}requestAnimationFrame(){window.requestAnimationFrame((t=>this.renderLoop(t)));}renderLoop(t){0===this.lastRenderTime?(this.lastRenderTime=t,this.fps=0):(this.renderDelta=t-this.lastRenderTime,this.lastRenderTime=t,this.fps=1e3/this.renderDelta,this.averageFps=.95*this.averageFps+.05*this.fps),this.keys.updateKeys(t),this.mouse.update(t),this.update&&this.update(),this.flush(),this.render(),this.requestAnimationFrame();}}}},i={};function e(s){if(i[s])return i[s].exports;var r=i[s]={exports:{}};return t[s](r,r.exports,e),r.exports}return e.d=(t,i)=>{for(var s in i)e.o(i,s)&&!e.o(t,s)&&Object.defineProperty(t,s,{enumerable:!0,get:i[s]});},e.o=(t,i)=>Object.prototype.hasOwnProperty.call(t,i),e.r=t=>{"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0});},e(612)})()}));

    }(wglt));

    const keys = [
        // Arrows
        wglt.exports.Keys.VK_LEFT,
        wglt.exports.Keys.VK_UP,
        wglt.exports.Keys.VK_RIGHT,
        wglt.exports.Keys.VK_DOWN,
        wglt.exports.Keys.VK_CLEAR,
        // Numpad
        wglt.exports.Keys.VK_NUMPAD4,
        wglt.exports.Keys.VK_NUMPAD8,
        wglt.exports.Keys.VK_NUMPAD6,
        wglt.exports.Keys.VK_NUMPAD2,
        wglt.exports.Keys.VK_NUMPAD5,
        // VI keys
        wglt.exports.Keys.VK_H,
        wglt.exports.Keys.VK_K,
        wglt.exports.Keys.VK_L,
        wglt.exports.Keys.VK_J,
        wglt.exports.Keys.VK_PERIOD,
        // other stuff
        wglt.exports.Keys.VK_ESCAPE,
        wglt.exports.Keys.VK_PAGE_UP,
        wglt.exports.Keys.VK_PAGE_DOWN,
        wglt.exports.Keys.VK_END,
        wglt.exports.Keys.VK_HOME,
        wglt.exports.Keys.VK_G,
        wglt.exports.Keys.VK_V,
    ];
    class Display {
        i;
        container;
        e;
        w;
        h;
        mx;
        my;
        term;
        constructor(i, container) {
            this.i = i;
            this.container = container;
            this.e = document.createElement("canvas");
            this.w = i.displayWidth;
            this.h = i.displayHeight;
            this.term = new wglt.exports.Terminal(this.e, this.w, this.h);
            this.mx = 0;
            this.my = 0;
            container.append(this.e);
            this.refresh();
            this.term.update = this.update.bind(this);
            this.e.focus();
        }
        update() {
            let dirty = false;
            let k = 0;
            for (let i = 0; i < keys.length; i++) {
                const vk = keys[i];
                if (this.term.isKeyPressed(vk)) {
                    k = vk;
                    break;
                }
            }
            if (k && this.i.input(k))
                dirty = true;
            if (this.term.mouse.x !== this.mx || this.term.mouse.y !== this.my) {
                this.mx = this.term.mouse.x;
                this.my = this.term.mouse.y;
                this.i.hover(this.mx, this.my);
                dirty = true;
            }
            if (dirty)
                this.refresh();
        }
        refresh() {
            const { term } = this;
            const { display, displayFg, displayBg } = this.i;
            let i = 0, j = 0;
            for (let y = 0; y < this.h; y++) {
                for (let x = 0; x < this.w; x++) {
                    const ch = display.getUint8(i);
                    const fg = displayFg.getUint32(j, true);
                    const bg = displayBg.getUint32(j, true);
                    term.drawChar(x, y, ch, fg, bg);
                    i++;
                    j += 4;
                }
            }
        }
    }

    var mainUrl = "code.wasm";

    var stdlibUrl = "stdlib.wasm";

    const range = (max) => Array.from(Array(max).keys());
    const rng = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

    class WasmInterface {
        i;
        bits;
        display;
        displayFg;
        displayBg;
        entities;
        maxEntities;
        map;
        raw;
        tileTypes;
        constructor(i) {
            this.i = i;
            const empty = new ArrayBuffer(0);
            this.bits = {};
            this.display = new DataView(empty);
            this.displayFg = new DataView(empty);
            this.displayBg = new DataView(empty);
            this.entities = new DataView(empty);
            this.maxEntities = 0;
            this.map = new DataView(empty);
            this.raw = new DataView(empty);
            this.tileTypes = [];
        }
        get mapWidth() {
            return this.i.gMapWidth.value;
        }
        get mapHeight() {
            return this.i.gMapHeight.value;
        }
        get mapSize() {
            return this.mapWidth * this.mapHeight;
        }
        get displayWidth() {
            return this.i.gDisplayWidth.value;
        }
        get displayHeight() {
            return this.i.gDisplayHeight.value;
        }
        get displaySize() {
            return this.displayWidth * this.displayHeight;
        }
        slice(start, length) {
            return new DataView(this.i.memory.buffer, start, length);
        }
        log() {
            const messages = [];
            let o = this.i.gMessageLog.value;
            for (let i = 0; i < this.i.gMessageCount.value; i++) {
                const count = this.raw.getUint8(o + 4);
                if (count)
                    messages.push({
                        count,
                        fg: this.raw.getUint32(o, true),
                        message: this.string(o + 5),
                    });
                o += this.i.gMessageSize;
            }
            return messages;
        }
        string(offset) {
            const bytes = [];
            for (;; offset++) {
                const ch = this.raw.getUint8(offset);
                if (ch === 0)
                    return String.fromCharCode(...bytes);
                bytes.push(ch);
            }
        }
        entity(id) {
            const mask = this.entities.getBigUint64(id * this.i.gEntitySize.value, true);
            const e = { id };
            if (mask & this.bits.Appearance)
                e.Appearance = this.appearance(id);
            if (mask & this.bits.AI)
                e.AI = this.ai(id);
            if (mask & this.bits.Fighter)
                e.Fighter = this.fighter(id);
            if (mask & this.bits.Position)
                e.Position = this.position(id);
            if (mask & this.bits.Player)
                e.Player = true;
            if (mask & this.bits.Solid)
                e.Solid = true;
            return e;
        }
        appearance(id) {
            const size = 10;
            const offset = id * size + this.i.gAppearances.value;
            const mem = this.slice(offset, size);
            return {
                ch: mem.getUint8(0),
                layer: mem.getUint8(1),
                fg: mem.getUint32(2, true),
                name: this.string(mem.getUint32(6, true)),
            };
        }
        ai(id) {
            const size = 1;
            const offset = id * size + this.i.gAIs.value;
            const mem = this.slice(offset, size);
            return {
                fn: mem.getUint8(0),
            };
        }
        fighter(id) {
            const size = 16;
            const offset = id * size + this.i.gFighters.value;
            const mem = this.slice(offset, size);
            return {
                maxHp: mem.getUint32(0, true),
                hp: mem.getInt32(4, true),
                defence: mem.getUint32(8, true),
                power: mem.getUint32(12, true),
            };
        }
        position(id) {
            const size = 2;
            const offset = id * size + this.i.gPositions.value;
            const mem = this.slice(offset, size);
            return {
                x: mem.getUint8(0),
                y: mem.getUint8(1),
            };
        }
        tt(id) {
            const tSize = this.i.gTileTypeSize.value;
            const offset = id * tSize;
            const mem = this.slice(offset, tSize);
            return {
                walkable: mem.getUint8(0) !== 0,
                transparent: mem.getUint8(1) !== 0,
                ch: mem.getUint8(2),
                fg: mem.getUint32(3, true),
                bg: mem.getUint32(7, true),
                fgLight: mem.getUint32(11, true),
                bgLight: mem.getUint32(15, true),
            };
        }
        initialise(width, height) {
            this.i.initialise(width, height);
            this.maxEntities = this.i.gMaxEntities.value;
            this.entities = this.slice(this.i.gEntities.value, this.i.gEntitySize.value * this.maxEntities);
            this.map = this.slice(this.i.gMap.value, this.mapSize);
            this.display = this.slice(this.i.gDisplay.value, this.displaySize);
            this.displayFg = this.slice(this.i.gDisplayFG.value, this.displaySize * 4);
            this.displayBg = this.slice(this.i.gDisplayBG.value, this.displaySize * 4);
            this.raw = new DataView(this.i.memory.buffer);
            this.tileTypes = range(this.i.gTileTypeCount.value).map((id) => this.tt(id));
            this.bits = {
                Appearance: this.i.Mask_Appearance.value,
                AI: this.i.Mask_AI.value,
                Fighter: this.i.Mask_Fighter.value,
                Position: this.i.Mask_Position.value,
                Player: this.i.Mask_Player.value,
                Solid: this.i.Mask_Solid.value,
            };
        }
        input(id) {
            return this.i.input(id);
        }
        hover(x, y) {
            this.i.hover(x, y);
        }
    }
    const getWASM = (url, imports) => new Promise((resolve, reject) => {
        WebAssembly.instantiateStreaming(fetch(url), imports)
            .then(({ instance }) => resolve(instance.exports))
            .catch(reject);
    });
    async function getInterface() {
        let iface = undefined;
        const debug = (offset) => {
            if (!iface || iface.raw.byteLength === 0)
                return;
            const message = iface.string(offset);
            console.log(message);
        };
        const stdlib = await getWASM(stdlibUrl);
        const main = await getWASM(mainUrl, { stdlib, host: { debug, rng } });
        iface = new WasmInterface(main);
        return iface;
    }

    getInterface().then((i) => {
        const container = document.getElementById("container") || document.body;
        window.i = i;
        i.initialise(80, 40);
        const d = new Display(i, container);
        window.d = d;
    });

}());
//# sourceMappingURL=bundle.js.map
