export default function emailProtectionScript() {
  function e(e) {
    try {
      if (typeof console === "undefined") return;
      if ("error" in console) {
        console.error(e);
      } else {
        console.log(e);
      }
    } catch (e) {}
  }

  function decodeAndSetHref(encodedHref) {
    var decodedHref = decodeURIComponent(escape(encodedHref));
    d.innerHTML = '<a href="' + decodedHref.replace(/"/g, "") + '"></a>';
    return d.childNodes[0].getAttribute("href") || "";
  }

  function extractCharCode(encodedString, startIndex) {
    var hexSubstring = encodedString.substr(startIndex, 2);
    return parseInt(hexSubstring, 16);
  }

  function decryptEmail(encodedEmail, startIndex) {
    var decryptedEmail = "";
    var xorKey = extractCharCode(encodedEmail, startIndex);
    for (var i = startIndex + 2; i < encodedEmail.length; i += 2) {
      var charCode = extractCharCode(encodedEmail, i) ^ xorKey;
      decryptedEmail += String.fromCharCode(charCode);
    }
    return decodeAndSetHref(decryptedEmail);
  }

  function protectEmailLinks(documentNode) {
    var emailLinks = documentNode.querySelectorAll("a");
    for (var i = 0; i < emailLinks.length; i++) {
      try {
        var linkElement = emailLinks[i];
        var linkIndex = linkElement.href.indexOf(protectionKey);
        if (linkIndex > -1) {
          linkElement.href = "mailto:" + decryptEmail(linkElement.href, linkIndex + protectionKey.length);
        }
      } catch (error) {
        e(error);
      }
    }
  }

  function replaceEmailElements(documentNode) {
    var emailElements = documentNode.querySelectorAll(emailElementSelector);
    for (var i = 0; i < emailElements.length; i++) {
      try {
        var emailElement = emailElements[i];
        var parentElement = emailElement.parentNode;
        var encodedEmail = emailElement.getAttribute(emailAttribute);
        if (encodedEmail) {
          var decodedEmail = decryptEmail(encodedEmail, 0);
          var textNode = document.createTextNode(decodedEmail);
          parentElement.replaceChild(textNode, emailElement);
        }
      } catch (error) {
        e(error);
      }
    }
  }

  function processTemplates(documentNode) {
    var templateElements = documentNode.querySelectorAll("template");
    for (var i = 0; i < templateElements.length; i++) {
      try {
        protectEmailLinks(templateElements[i].content);
        replaceEmailElements(templateElements[i].content);
        processTemplates(templateElements[i].content);
      } catch (error) {
        e(error);
      }
    }
  }

  var protectionKey = "/cdn-cgi/l/email-protection#";
  var emailElementSelector = ".cf_email";
  var emailAttribute = "data-cfemail";
  var d = document.createElement("div");

  // 함수 호출의 결과를 변수에 할당하고 사용합니다.
  var result = processTemplates(document);
  console.log(result); // 결과를 콘솔에 출력하거나 필요한 곳에서 사용합니다.
}
