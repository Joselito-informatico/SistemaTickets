// Componente para crear un ticket utilizando Lexical para el editor de texto enriquecido.

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import "./CrearTicket.css";

const CATEGORIAS = {
  Hardware: ["Teclado", "Monitor", "CPU", "Impresora"],
  Software: ["Sistema Operativo", "Aplicaciones", "Licencias"],
  Redes: ["WiFi", "Cableado", "Firewall"],
};

const editorConfig = {
  theme: {},
  onError(error) {
    console.error(error);
  },
};

const CrearTicket = () => {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("Hardware");
  const [subcategoria, setSubcategoria] = useState(CATEGORIAS["Hardware"][0]);
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  // Plugin para actualizar el estado del editor y capturar el contenido
  function LexicalOnChangePlugin() {
    const [editor] = useLexicalComposerContext();
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const textContent = $getRoot().getTextContent();
        setDescripcion(textContent);
      });
    });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo || !descripcion || !categoria || !subcategoria) {
      toast.error("Todos los campos son obligatorios");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No estás autenticado.");
        return;
      }
      await axios.post(
        `${process.env.REACT_APP_API_URL}/tickets`,
        { titulo, categoria, subcategoria, descripcion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Ticket creado correctamente");
      setTitulo("");
      setDescripcion("");
    } catch (error) {
      console.error("Error al crear ticket:", error);
      toast.error("Error al crear ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crear-ticket-container">
      <h1>Crear Ticket</h1>
      <form onSubmit={handleSubmit}>
        <label>Título</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
        <label>Categoría</label>
        <select
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value);
            setSubcategoria(CATEGORIAS[e.target.value][0]);
          }}
        >
          {Object.keys(CATEGORIAS).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <label>SubCategoría</label>
        <select
          value={subcategoria}
          onChange={(e) => setSubcategoria(e.target.value)}
        >
          {CATEGORIAS[categoria].map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
        <label>Descripción</label>
        <LexicalComposer initialConfig={editorConfig}>
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<div className="editor-placeholder"></div>}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <LexicalOnChangePlugin />
        </LexicalComposer>
        <button type="submit" disabled={loading}>
          {loading ? "Creando Ticket..." : "Crear Ticket"}
        </button>
      </form>
    </div>
  );
};

export default CrearTicket;