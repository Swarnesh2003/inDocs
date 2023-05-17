import { v4 as uuidv4 } from 'uuid'; 
import React, {useEffect, useCallback, useState} from "react";
import {useParams} from 'react-router-dom';
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "./TextEditor.css";
import io from "socket.io-client"
const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block','image'],
  
    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction
  
    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],
  
    ['clean']                                         // remove formatting button
  ];

const SAVE_INTERVAL_MS = 2000
const TextEditor = () =>{
    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();
    const {id: documentId} = useParams();
    useEffect(()=>{
        const s=io("http://localhost:5000")
        setSocket(s);
        console.log(s)
        s.emit("data", "Hey I am connected!")
        return()=>{
            s.disconnect();
        };

    },[])

    useEffect(()=>{
        if(socket == null || quill == null ){
            return
        }
        const handler = (delta, oldDelta, source) =>{
            console.log(delta)
            console.log(oldDelta)
            if(source!=="user") return;
            socket.emit("send-changes", delta);
        }
        quill.on("text-change",handler);
        return()=>{
            quill.off("text-change", handler);
        }
    },[socket, quill])

    useEffect(()=>{
        if(socket==null || quill==null) return;
        socket.once("load-document", (document)=>{
            quill.setContents(document);
            quill.enable();
        });
        socket.emit("get-document", documentId);
        }, [socket, quill, documentId] )

    useEffect(()=>{
        if(socket==null || quill==null) return;
        
        const interval = setInterval(()=>{
            socket.emit("save-document", quill.getContents())
            }, SAVE_INTERVAL_MS)
        return () => {
            clearInterval(interval);
        }
        }, [socket, quill] )
    
    
    


    useEffect(()=>{
        if (socket==null|| quill== null) return
        const handler = (delta) =>{
            quill.updateContents(delta)
        }
        socket.on("recieve-changes", handler)
        return()=>{
            socket.off("recieve-changes", handler)
        }
    },[socket, quill])


    const wrapperRef = useCallback((wrapper)=>{ // wrapper will get all the contents inside wrapperRef
        if(wrapper == null) return;
        wrapper.innerHTML = "";
        const editor = document.createElement("div");
        wrapper.append(editor);
        const q = new Quill(editor, {  // q - to get quill data
            theme: "snow",
            modules: {
                toolbar: toolbarOptions
            }
        });
        console.log(q)
        q.disable();
        q.setText("Loading...")
        setQuill(q)
    },[])
    return(
        <div>  
        <div className="container" ref={wrapperRef}></div>
        </div>
 
    )
}

export default TextEditor;