define([],function(){
  var xmlns={
    svg:"http://www.w3.org/2000/svg",
    xlink:"http://www.w3.org/1999/xlink",
    xhtml:"http://www.w3.org/1999/xhtml"
  }
  
  var classes={
    background:"background",
    graph:"view_graph",
    nodePrototype:"view_node_prototype",
    labelContainer:"view_label_container",
    infoContainer:"view_info_container",
    allTextContainer:"view_all_text_container",
    node:"view_node",
    link:"view_link",
    hyperlink:"view_hyperlink",
    hyperlinkLabel:"view_hyperlink_label",
    protoHyperlink:"view_protohyperlink",
    protoHyperlinkLabel:"view_protohyperlink_label",
    toolbox:"viewtools_toolbox",
    toolEdit:"viewtools_edit"
  }
  
  var other={
    unsavedNode:"unsaved_node",
    unsavedHyperlink:"unsaved_hyperlink"
  }
  
  return {
    xmlns:xmlns,
    classes:classes,
    other:other
  };
});