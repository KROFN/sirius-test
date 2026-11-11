#!/usr/bin/env python3
"""Prepare a transparent cutout from the ORIGINAL hero photo, not a synthetic image.

Optional one-off build dependency: opencv-python-headless, numpy, ffmpeg.
Coordinates intentionally correspond to assets/img/responsive/hero-08-736.jpg.
Generated output: assets/img/hero-model-cutout.webp.
"""
from pathlib import Path
import subprocess
import cv2
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
source=ROOT/"assets/img/responsive/hero-08-736.jpg"
png=ROOT/"assets/img/hero-model-cutout-tmp.png"
out=ROOT/"assets/img/hero-model-cutout.webp"
im=cv2.imread(str(source))
assert im is not None and im.shape[:2]==(1104,736), "Hero photo changed; mask needs recalibration"
h,w=im.shape[:2]
mask=np.full((h,w),cv2.GC_PR_BGD,np.uint8)

# Only real photographed objects are foreground; background is flat studio paper.
mask[:290,:]=cv2.GC_BGD
mask[:,:60]=cv2.GC_BGD
mask[:,695:]=cv2.GC_BGD
mask[1035:,:]=cv2.GC_BGD
outline=np.array([[287,317],[372,307],[394,445],[462,453],[668,553],[680,678],[630,706],
                  [512,635],[463,619],[482,797],[556,921],[440,947],[360,884],[327,960],
                  [260,1040],[78,965],[93,857],[158,824],[220,691],[247,562],[257,468]],np.int32)
cv2.fillPoly(mask,[outline],cv2.GC_PR_FGD)
for center,axes in [((336,377),(27,46)),((325,520),(34,68)),((374,640),(65,100)),((274,753),(23,102)),((198,895),(25,55))]:
    cv2.ellipse(mask,center,axes,0,0,360,cv2.GC_FGD,-1)
for a,b,weight in [((408,457),(629,603),13),((326,573),(368,614),10),((269,700),(166,939),15)]:
    cv2.line(mask,a,b,cv2.GC_FGD,weight)
for a,b in [((454,560),(537,552)),((452,560),(320,893)),((372,718),(530,881)),((357,711),(487,708))]:
    cv2.line(mask,a,b,cv2.GC_PR_FGD,9)
cv2.rectangle(mask,(480,700),(670,790),cv2.GC_BGD,-1)
bg_model=np.zeros((1,65),np.float64)
fg_model=np.zeros((1,65),np.float64)
cv2.grabCut(im,mask,None,bg_model,fg_model,8,cv2.GC_INIT_WITH_MASK)

alpha=np.where((mask==1)|(mask==3),255,0).astype(np.uint8)
# Remove light neutral residue between rails while preserving warm skin and dark chair.
maxch=im.max(axis=2).astype(np.float32)
minch=im.min(axis=2).astype(np.float32)
chroma=maxch-minch
luma=im.mean(axis=2)
neutral=np.clip((42-chroma)/20,0,1)
bright=np.clip((luma-105)/50,0,1)
alpha=alpha.astype(np.float32)*(1-.98*neutral*bright)
# The photographed floor is not a cutout object. Fade its pale residue,
# but retain dark shoes, dress and metal chair outlines.
yy,xx=np.indices((h,w))
ground_zone=np.maximum(np.clip((yy-740)/115,0,1)*np.clip((xx-250)/85,0,1),np.clip((yy-880)/65,0,1))
ground_tone=np.clip((74-chroma)/34,0,1)*np.clip((luma-85)/45,0,1)
alpha=(alpha*(1-.985*ground_zone*ground_tone)).astype(np.uint8)
alpha=cv2.GaussianBlur(alpha,(5,5),1.1)

rgba=np.dstack((im,alpha))
# Crop unused empty gray space to make the hero subject positionable responsively.
crop=rgba[298:1038,72:694]
cv2.imwrite(str(png),crop)
subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(png),
                "-c:v","libwebp","-quality","90","-compression_level","6",
                "-pix_fmt","yuva420p",str(out)],check=True)
png.unlink()
print("source",source.name,"->",out.relative_to(ROOT),out.stat().st_size,"bytes")
