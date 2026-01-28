"use client";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface TextEditorProps {
  setText: (html: string, plain: string) => void;
  text: string;
  formats?: boolean;
  placeholder?: string;
  className?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({
  setText,
  text,
  formats = true,
  placeholder = "Placeholder text is in here",
  className = "placeholder:text-black dark:placeholder:text-white bg-transparent border-none focus:outline-none w-full text-2xl font-Monument",
}) => {
  const handleChange = (value: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = value;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    setText(value, plainText);
  };

  const modules = {
    toolbar: formats
      ? [
          [{ header: "1" }, { header: "2" }],
          ["bold", "italic", "underline", "strike", "blockquote", "code-block"], // ✅ added `code-block`
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
        ]
      : false,
  };

  const editorFormats = formats
    ? [
        "header",
        "font",
        "size",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "code-block", // ✅ add this
        "list",
        "bullet",
        "indent",
        "link",
        "image",
      ]
    : [];

  return (
    <div className="text-black placeholder:text-black dark:text-white dark:placeholder:text-white">
      <ReactQuill
        value={text}
        onChange={handleChange}
        modules={modules}
        formats={editorFormats}
        className={className}
        placeholder={placeholder}
      />
    </div>
  );
};

export default TextEditor;
