import zipfile
import xml.etree.ElementTree as ET

def read_docx(file_path):
    with zipfile.ZipFile(file_path, 'r') as z:
        xml_content = z.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        text = []
        for paragraph in tree.findall('.//w:p', ns):
            p_text = ''
            for run in paragraph.findall('.//w:r', ns):
                for text_node in run.findall('.//w:t', ns):
                    if text_node.text:
                        p_text += text_node.text
            if p_text:
                text.append(p_text)
        return '\n'.join(text)

with open('doc_output.txt', 'w', encoding='utf-8') as f:
    f.write(read_docx('d:/pulsegoals/6a06fcd06885a_AtomQuest_Hackathon_1.0_Problem_Statement_.docx'))
