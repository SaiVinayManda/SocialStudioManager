"""Original reusable visual components. Only consumes validated data, never code."""
import math
import subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 540, 960, 30


def font(size, bold=False):
    return ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf", size)


def label(draw, xy, text, size=25, color="#c8dedf", width=25):
    words=text.split(); lines=[]; line=""
    for word in words:
        if len(line)+len(word)>width: lines.append(line); line=word
        else: line=(line+" "+word).strip()
    if line: lines.append(line)
    draw.multiline_text(xy,"\n".join(lines),font=font(size,True),fill=color,spacing=9)


def illustration(scene, phase, palette):
    env=scene["environment"]; im=Image.new("RGB",(W,H),palette[0]); d=ImageDraw.Draw(im)
    accent=palette[1]
    if env in ("mirror","phone","window","hallway"):
        d.polygon([(0,0),(540,0),(435,180),(105,180)],fill="#1e2c35")
        d.rectangle((105,180,435,760),fill="#25313b")
        d.polygon([(0,960),(105,760),(435,760),(540,960)],fill="#30323c")
        for x in (50,170,370,490): d.line((270+(x-270)*.5,760,x,960),fill="#131e27",width=2)
    if env=="mirror":
        # Bedroom furniture and a cool reflection, independent from the camera.
        d.rectangle((25,620,190,770),fill="#44404b");d.polygon([(15,620),(90,570),(192,610),(190,650)],fill="#66616c")
        d.ellipse((380,360,427,395),fill=accent);d.line((404,390,404,535),fill="#9c8662",width=4)
        d.rounded_rectangle((195,237,387,656),radius=40,fill="#967d60",outline="#b39a79",width=5)
        d.rounded_rectangle((208,252,374,641),radius=32,fill="#243d4b")
        for x in range(215,368,18):d.line((x,270,x-8,620),fill="#2b4654",width=3)
        shift=int(9*math.sin(phase*5)); d.ellipse((271+shift,353,307+shift,399),fill="#111d29")
        d.polygon([(281+shift,396),(303+shift,396),(334+shift,566),(244+shift,566)],fill="#172432")
        if phase>.58:d.ellipse((282+shift,372,285+shift,375),fill="#d5dfe2")
        d.line((218,270,357,620),fill="#627a83",width=2)
    elif env=="phone":
        # Animated typography on a phone is a separate component, not a title
        # swap on an environment scene. Notification text appears progressively.
        d.ellipse((85,690,470,810),fill="#19242b");d.rectangle((40,782,520,798),fill="#777164")
        glow=Image.new("RGB",(W,H),(0,0,0));g=ImageDraw.Draw(glow);g.ellipse((80,210,470,720),fill="#234a5c");glow=glow.filter(ImageFilter.GaussianBlur(45));im=Image.blend(im,glow,.28);d=ImageDraw.Draw(im)
        x,y=169,292;d.rounded_rectangle((x-10,y-14,x+214,y+390),radius=34,fill="#080d15",outline="#86939e",width=3)
        d.rounded_rectangle((x,y,x+204,y+375),radius=24,fill="#20414b")
        d.rounded_rectangle((230,297,306,314),radius=8,fill="#0b171e")
        d.text((190,345),"03:00",font=font(32),fill="#dce2e1")
        if phase>.16:
            d.rounded_rectangle((181,409,361,557),radius=13,fill="#bed5cf")
            d.text((193,426),"UNKNOWN",font=font(14,True),fill="#163d43")
            content=scene["text_overlay"] or "A NEW MESSAGE"
            label(d,(193,460),content[:max(1,int((phase-.16)*len(content)/.48))],19,"#123038",14)
        d.line((234,650,303,650),fill="#8facae",width=3)
    elif env in ("road","street"):
        # Original painted landscape, subsequently used as a still-motion shot.
        for y in range(H):d.line((0,y,W,y),fill=(20+int(y/80),30+int(y/90),42+int(y/120)))
        for x in range(-20,600,80):
            d.rectangle((x,140,x+19,560),fill="#15232d")
            d.polygon([(x-40,340),(x+9,160),(x+55,340)],fill="#182b36")
        d.polygon([(239,505),(301,505),(540,960),(0,960)],fill="#303942")
        d.polygon([(100,940),(261,533),(268,533),(222,960)],fill="#b1ac84")
        d.polygon([(440,940),(279,533),(272,533),(318,960)],fill="#b1ac84")
        for i in range(5):
            y=560+i*i*17;d.polygon([(269-i,y),(273+i,y),(275+i,y+8+i*4),(266-i,y+8+i*4)],fill="#879491")
        d.ellipse((264,463,279,484),fill="#080e15");d.polygon([(266,483),(278,483),(287,529),(256,529)],fill="#0d141c")
        fog=Image.new("RGBA",(W,H),(0,0,0,0));fd=ImageDraw.Draw(fog)
        for y in (370,430,490):fd.ellipse((-90,y,640,y+95),fill=(143,169,177,37))
        im=Image.alpha_composite(im.convert("RGBA"),fog.filter(ImageFilter.GaussianBlur(23))).convert("RGB")
    elif env=="hallway":
        d.rectangle((178,260,366,701),fill="#12191c");d.rectangle((190,273,353-int(20*phase),688),fill="#70573c")
        for y in (300,490):d.rectangle((207,y,333-int(20*phase),y+160),outline="#332c27",width=4)
        d.ellipse((330-int(20*phase),470,340-int(20*phase),480),fill=accent)
    elif env=="window":
        d.rectangle((143,253,397,621),fill="#131e34",outline=accent,width=8)
        d.ellipse((292,278,342,328),fill="#a2bdcf")
        d.line((270,255,270,620),fill=accent,width=7);d.line((143,435,397,435),fill=accent,width=7)
        d.polygon([(105,239),(164,250),(150+int(12*math.sin(phase*5)),664),(86,681)],fill="#475665")
    elif env=="forest":
        d.ellipse((345,120,427,202),fill="#b6c6bd")
        for i in range(12):
            x=(i*71)%580-20;y=250+(i%3)*75
            d.rectangle((x,y,x+12,960),fill="#162927");d.polygon([(x-80,y+210),(x+6,y),(x+93,y+210)],fill="#28403b")
        d.polygon([(248,580),(286,580),(390,960),(95,960)],fill="#6d786d")
    elif env in ("product","travel"):
        if env=="travel":
            d.ellipse((356,174,445,263),fill=accent)
            d.polygon([(0,618),(170,307),(366,642)],fill="#54777b");d.polygon([(198,664),(394,366),(540,618)],fill="#69848a")
            d.polygon([(110,418),(170,307),(233,415),(181,389),(151,425)],fill="#d4e1dc")
            d.rectangle((0,660,540,960),fill="#214f65")
            for y in range(690,960,37):d.line((30,y,510,y+int(4*math.sin(phase*4))),fill="#528895",width=2)
        else:
            d.rounded_rectangle((65,260,475,685),radius=24,fill="#243d5d",outline=accent,width=3)
            for i,v in enumerate((.4,.65,.5,.86)):
                top=610-int(v*220*min(1,phase*2+.2));x=117+i*77;d.rectangle((x,top,x+39,610),fill=accent)
            d.line((98,614,443,614),fill="#c7d4e0",width=3)
        label(d,(55,120),scene["text_overlay"] or scene["visual_description"][:64],29,accent,25)
    else:
        for i in range(7):
            x=270+int(math.sin(i+phase*2)*145);y=230+i*70
            d.ellipse((x-110,y-110,x+110,y+110),outline=accent,width=2+i%3)
        label(d,(60,360),scene["text_overlay"] or scene["visual_description"][:70],30,"#e2e8ee",24)
    if scene["component"]=="graphic" and env not in ("product","travel"):
        d.rounded_rectangle((75,310,465,590),radius=18,fill="#203947",outline=accent,width=3)
        label(d,(98,350),scene["text_overlay"] or scene["visual_description"][:60],28,"#dce8e8",22)
    if scene["text_overlay"] and env not in ("phone","product","travel") and scene["component"]!="graphic":
        d=ImageDraw.Draw(im)
        text=scene["text_overlay"]
        if scene["component"]=="typography":text=text[:max(1,int(len(text)*min(1,phase*1.8)))]
        d.rounded_rectangle((40,90,500,235),radius=12,fill="#1a2a3b")
        label(d,(60,115),text,24,"#dce8e8",28)
    return im


def render_scene(scene, output, profile, logs, asset=None, previous_frame=None):
    output=Path(output); frames=round(scene["duration_seconds"]*FPS)
    base=None
    if asset and asset["kind"]=="image":base=Image.open(asset["path"]).convert("RGB");base=base.resize((W,H),Image.Resampling.LANCZOS)
    elif scene["component"]=="image_motion":
        base=illustration(scene,.5,profile["palette"]);base.save(output.with_suffix(".png"))
    if asset and asset["kind"]=="video":
        # Bounded local stock use; all licence/hash checks happen before staging.
        source_frames=Path(logs)/("source-"+output.stem+"-%04d.png")
        subprocess.run(["ffmpeg","-nostdin","-n","-protocol_whitelist","file,pipe","-i",asset["path"],"-t",str(scene["duration_seconds"]),"-vf","scale=540:960:force_original_aspect_ratio=increase,crop=540:960,fps=30","-threads","2",str(source_frames)],capture_output=True,check=True,timeout=45)
    else:source_frames=None
    cmd=["ffmpeg","-nostdin","-n","-f","rawvideo","-pix_fmt","rgb24","-s","540x960","-r","30","-i","pipe:0","-an","-c:v","libx264","-preset","fast","-crf","18","-threads","4","-pix_fmt","yuv420p",str(output)]
    rng=np.random.default_rng(scene["scene_number"]*101)
    yy,xx=np.mgrid[0:H,0:W]; vignette=np.clip(1-.2*((xx-270)/360)**2-.13*((yy-480)/650)**2,.55,1)
    with (Path(logs)/(output.stem+".stderr")).open("wb") as err:
        proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stdout=subprocess.DEVNULL,stderr=err)
        try:
            for i in range(frames):
                p=i/max(1,frames-1)
                if source_frames:
                    candidate=Path(str(source_frames).replace("%04d",f"{i+1:04}"))
                    if candidate.exists():base=Image.open(candidate).convert("RGB")
                    elif base is None:raise RuntimeError("Selected source video produced no frames")
                im=(base.copy() if base else illustration(scene,p,profile["palette"]))
                z=1.035+.16*p;cw=int(W/z);ch=int(H/z)
                camera=scene["camera_movement"];cx=int((W-cw)*(.1+.8*p if camera=="pan_right" else .9-.8*p if camera=="pan_left" else .5));cy=int((H-ch)*.4)
                im=im.crop((cx,cy,cx+cw,cy+ch)).resize((W,H),Image.Resampling.BICUBIC)
                if previous_frame is not None and scene["transition"] in ("fade","dissolve") and i<6:im=Image.blend(previous_frame,im,(i+1)/6)
                pixels=np.asarray(im).astype(np.float32)*vignette[:,:,None]+rng.normal(0,.45,(H,W,1));im=Image.fromarray(np.clip(pixels,0,255).astype(np.uint8))
                if i==frames//2:im.save(output.with_name(output.stem+"-raw-mid.png"))
                proc.stdin.write(im.tobytes())
            proc.stdin.close()
            if proc.wait(timeout=45)!=0:raise RuntimeError("Scene encode failed")
        finally:
            if proc.poll() is None:proc.kill();proc.wait(timeout=5)
    return im


def motion_metrics(file):
    result=subprocess.run(["ffmpeg","-nostdin","-v","error","-threads","2","-i",str(file),"-vf","scale=135:240","-pix_fmt","gray","-f","rawvideo","pipe:1"],capture_output=True,check=True,timeout=40)
    frames=np.frombuffer(result.stdout,dtype=np.uint8).reshape((-1,240,135)).astype(np.float32)
    delta=np.abs(np.diff(frames,axis=0)).mean(axis=(1,2));same=0;longest=0
    for v in delta:same=same+1 if v==0 else 0;longest=max(longest,same)
    coarse=[float(np.abs(frames[i]-frames[i-30]).mean()) for i in range(30,len(frames),30)]
    return {"decoded_frames":len(frames),"mean_adjacent_frame_difference":float(delta.mean()),"longest_exact_duplicate_run":longest,"one_second_differences":coarse,"passed":longest<15 and (not coarse or min(coarse)>.5)}
