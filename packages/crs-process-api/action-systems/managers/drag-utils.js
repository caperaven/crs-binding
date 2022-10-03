function a(r,e){const t=e?.dragQuery||"[draggable='true']";return r.target.matches(t)?r.target:r.target.parentElement?.matches(t)?r.target.parentElement:null}export{a as getDraggable};
