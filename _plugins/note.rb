class FootnoteInlineTag < Liquid::Tag
  def initialize(tag_name, input, tokens)
    super
    @input = input
  end

  def render(context)
    counter = context['footnote_counter'];
    if counter == nil
      counter = 0
    end
    
    counter = counter+1
    context['footnote_counter'] = counter;
    
    output =  "<sup class='footnote' onClick='showFootnote(this)' title=\""
    output += (@input).gsub(/"/,"&quot;")
    output += "\" data-title=\""
    output += (@input).gsub(/"/,"&quot;")
    output += "\">\["
    output += counter.to_s
    output += "\]</sup>"
    return output
  end
end
Liquid::Template.register_tag('note', FootnoteInlineTag)
