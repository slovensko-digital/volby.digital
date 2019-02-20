"use strict";

(function () {
    function handleCities(city) {
        var results = [];
        var city_id = 1;
        var cities = Object.keys(window.cities).forEach(function (kraj) {
            Object.keys(window.cities[kraj]).forEach(function (okres) {
                Object.keys(window.cities[kraj][okres]).forEach(function (mesto) {
                    results.push({
                        id: city_id++,
                        text: window.cities[kraj][okres][mesto][10] + (window.cities[kraj][okres][mesto][13] ? ' (' + okres + ')' : ''),
                        mesto: window.cities[kraj][okres][mesto][10],
                        kraj: kraj,
                        okres: okres,
                        email: window.cities[kraj][okres][mesto][6]
                    });
                });
            });
        });

        if (city) {
            var result;
            city = parseInt(city);
            $(results).filter(function (index, element) {
                return element.id === city;
            }).each(function (index, element) {
                result = element;
            });
            return result;
        }

        $(".section-request [name=city]").select2({
            // matcher: matchCustom,
            maximumInputLength: 2,
            data: results,
            placeholder: "napr. Banská Bystrica",
            width: 'resolve'
        });
    }

    $(document).on('focus', '.select2-selection', function (e) {
        if (e.originalEvent) {
            $(this).parent().parent().prev().select2("open");
        }
    });

    function formValidation() {
        var valid = true;

        var getInputValue = function getInputValue(t) {
            return $(".section-request [name=" + t + "]").val();
        };

        var resultWithError = function resultWithError(selector) {
            $(selector).show();
            valid = false;
        };

        $(".validation").hide();
        if (getInputValue("address").length < 5) resultWithError(".validation.address");
        if (getInputValue("name").length < 6) resultWithError(".validation.name");
        if (getInputValue("zip").length < 4) resultWithError(".validation.zip");

        if (!(parseInt(getInputValue("city")) > 0)) // neda sa vycentrovat
        {
            $(".section-request [name=city]").select2('destroy');
            handleCities();
            resultWithError(".validation.city");
        }

        if (getInputValue("ssn").length < 9) resultWithError(".validation.ssn");
        return valid;
    }

    function fillTextareaRequest() {
        var getInputValue = function getInputValue(t) {
            return $(".section-request [name=" + t + "]").val();
        };

        var text = "\u017Diados\u0165 o vydanie hlasovacieho preukazu pre vo\u013Eby prezidenta SR v roku 2019.\n\nPod\u013Ea \xA746 z\xE1kona \u010D.180/2014 Z.z. o podmienkach v\xFDkonu volebn\xE9ho pr\xE1va a o zmene a doplnen\xED niektor\xFDch z\xE1konov \u017Eiadam o vydanie hlasovacieho preukazu pre vo\u013Eby prezidenta Slovenskej republiky v roku 2019.\n\nMoje \xFAdaje s\xFA\nMeno a priezvisko: $1\nRodn\xE9 \u010D\xEDslo: $2\nUlica a \u010D\xEDslo: $3\nMesto: $4\nPS\u010C: $5\n\u0160t\xE1tna pr\xEDslu\u0161nos\u0165: Slovensk\xE1";

        if (getQuery("whom") === "home") {
            text += "\n            \nPreukaz pros\xEDm zasla\u0165 na adresu trval\xE9ho pobytu.";
        } else if (getQuery("whom") === "other") {
            text += "\n            \nPreukaz pros\xEDm zasla\u0165 na kore\u0161ponden\u010Dn\xFA adresu: \n$6";
        } else if (getQuery("whom") === "someone") {
            text += "\n\nHlasovac\xED preukaz pros\xEDm vyda\u0165 nasledovnej splnocnenej osobe priamo v mieste \xFAradu: $7";
        }

        text += "\n\n\u017Diadam o hlasovac\xED preukaz platn\xFD pre dni 16. marca 2019 a 30. marca 2019.\n\nZ\xE1rove\u0148 \u017Eiadam o zaslanie potvrdenia, \u017Ee ste t\xFAto \u017Eiados\u0165 obdr\u017Eali.\n\n\u010Eakujem.";
        text = text.replace("$1", getInputValue("name"));
        text = text.replace("$2", getInputValue("ssn"));
        text = text.replace("$3", getInputValue("address"));
        var city = handleCities($(".section-request [name=city]").val());
        text = text.replace("$4", city.mesto);
        text = text.replace("$5", getInputValue("zip"));
        text = text.replace("$6", getInputValue("corresponding-address") + ", " + getInputValue("corresponding-city") + ", " + getInputValue("corresponding-zip") + ", " + getInputValue("corresponding-country"));
        text = text.replace("$7", getInputValue("responsible-name") + ", s číslom OP: " + getInputValue("responsible-id") + ".");
        $("#generated").val(text);
        return text;
    }

    function setQuery(obj) {
        var parsed = Qs.parse(location.search.replace("?", ""));
        Object.keys(obj).forEach(function (key) {
            parsed[key] = obj[key];
        });
        location.search = Qs.stringify(parsed);
    }

    function getQuery(key) {
        var parsed = Qs.parse(location.search.replace("?", ""));
        return parsed[key];
    }

    function handleUriParams() {
        function displaySlide(n) {
            if (n > 0) {
                $("nav").show();
            }

            $(".navigation li").removeClass("selected"); // handle menu items

            $(".navigation li").eq(n).addClass("selected"); // links after current one are styled

            $(".navigation li").filter(function (i, el) {
                return i > n;
            }).addClass("after"); // links before current one are links

            $(".navigation li").filter(function (i, el) {
                return i <= n;
            }).each(function (i) {
                var clickedItem = $(this);
                clickedItem.on("click", function () {
                    setQuery({
                        step: i
                    });
                });
            });
            $("aside").hide(); // handle displaying sections

            $("aside").eq(n).show();
        }

        var step = getQuery("step");

        if (!step) {
            setQuery({
                step: "0"
            });
        } else if (step === "0") {
            displaySlide(0);
        } else if (step === "1") {
            displaySlide(1);
        } else if (step === "2") {
            displaySlide(2);
        } else if (step === "3") {
            displaySlide(3);
        } else if (step === "4") {
            displaySlide(4);

            if (getQuery("whom") === "someone") {
                $(".responsible-person").show();
            } else if (getQuery("whom") === "other") {
                $(".corresponding-address").show(); // chcem poslat inam
            } else if (getQuery("whom") === "home") {// chcem poslat domov
            } else if (getQuery("whom") === "personally") {// chcem si ho prevziat osobne
            }

            if (getQuery("how") === "email") {
                $(".with-address").show(); // chcem ho poslat emailom
            } else if (getQuery("how") === "list") {// chcem ho poslat postou
            }
        } else if (step === "5") {
            displaySlide(5); // nema trvaly pobyt na uzemi SR
        } else if (step === "6") {
            displaySlide(6); // zoberie si to osobne
        }
    }

    function attachAllHandlers() {
        $(".section-info button").first().on("click", function (ev) {
            setQuery({
                step: "1"
            });
        });
        $(".section-request [name=name]").on("keyup", function (ev) {
            if (ev.currentTarget.value !== "pepek") return;
            $(".section-request [name=name]").val("Milan Rúfus");
            $(".section-request [name=address]").val("Kastielska 3230/7");
            $(".section-request [name=zip]").val("82104");
            $(".section-request [name=ssn]").val("9112318210");
            $(".section-request [name=responsible-name]").val("Jozef Cíger Hronský");
            $(".section-request [name=responsible-id]").val("XX123456");
            $(".section-request [name=corresponding-country]").val("Česká Republika");
            $(".section-request [name=corresponding-zip]").val("11811");
            $(".section-request [name=corresponding-city]").val("Praha");
            $(".section-request [name=corresponding-address]").val("Na Paši");
        });
        $(".section-request-button").on("click", function () {
            if (formValidation() !== true) {
                $("html, body").animate({
                    scrollTop: 0
                }, "slow");
            } else {
                fillTextareaRequest();
                $("html, body").animate({
                    scrollTop: $(document).height()
                }, "slow");
                $(".last-steps").show();
                var result = handleCities($(".section-request [name=city]").val());
                $("#last-steps-email").text(result.email);
                $(".section-request-button, .section-request section").hide();
                $("#generated, .last-steps").show();
                var email = "mailto:" + result.email;
                email += "?subject=" + encodeURIComponent("Žiadosť o vydanie hlasovacieho preukazu na voľby prezidenta SR 2019");
                email += "&body=" + encodeURIComponent(fillTextareaRequest());
                $(".email-button").attr("href", email);
            }
        });
        $(".email-button").on("click", function () {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Ziadost',
                eventAction: 'send',
                eventLabel: 'action-send'
            });
        });
        $("#clipboard-request").on("click", function () {
            $("#generated").select();
            document.execCommand("copy");
            $("#clipboard-request+small").show();
        });
        $("#clipboard-email").on("click", function () {
            var $temp = $("<input>");
            $("body").append($temp);
            $temp.val($("#last-steps-email").text()).select();
            document.execCommand("copy");
            $temp.remove();
            $("#clipboard-email+small").show();
        }); // trvaly pobyt mam

        $("#residence-sk").on("click", function () {
            setQuery({
                residence: "sk",
                step: "2"
            });
        }); // na slovensku

        $("#residence-out").on("click", function () {
            setQuery({
                residence: "out",
                step: "5"
            });
        }); // v zahranici
        // prevezmem

        $("#whom-home").on("click", function () {
            setQuery({
                whom: "home",
                step: "3"
            });
        }); // dorucit domov

        $("#whom-other").on("click", function () {
            setQuery({
                whom: "other",
                step: "3"
            });
        }); // dorucit inde

        $("#whom-someone").on("click", function () {
            setQuery({
                whom: "someone",
                step: "4"
            });
        }); // splnomocnenec

        $("#whom-personally").on("click", function () {
            setQuery({
                whom: "personally",
                step: "6"
            });
        }); // osobne
        // chcem dorucit

        $("#how-email").on("click", function () {
            setQuery({
                how: "email",
                step: "4"
            });
        }); // emailom

        $("#how-list").on("click", function () {
            setQuery({
                how: "list",
                step: "4"
            });
        }); // listom
        // chcem dorucit
    }

    handleUriParams();
    attachAllHandlers();
    handleCities();
})();
