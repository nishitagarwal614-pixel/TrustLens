from fastapi import APIRouter, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse

from app.models.schemas import AnalyzeResponse
from app.services.orchestrator import run_content_analysis


router = APIRouter()


@router.post(
    "/analyze",
    response_model=AnalyzeResponse
)
async def analyze(request: Request):

    print("\n" + "=" * 70)
    print("[TrustLens AI] ANALYSIS REQUEST")
    print("=" * 70)

    text = ""
    source_url = None
    creator_handle = None
    image_bytes = None

    try:

        # =================================================
        # READ REQUEST
        # =================================================

        content_type = (
            request.headers.get(
                "content-type",
                ""
            ).lower()
        )

        print(
            "[TrustLens AI] Content-Type:",
            content_type
        )


        # =================================================
        # JSON REQUEST
        # =================================================

        if "application/json" in content_type:

            try:

                data = await request.json()

            except Exception:

                data = {}

            if not isinstance(
                data,
                dict
            ):
                data = {}


            text = (
                data.get("text")
                or data.get("content")
                or data.get("claim")
                or ""
            )


            source_url = (
                data.get("source_url")
                or data.get("sourceUrl")
                or data.get("url")
                or None
            )


            creator_handle = (
                data.get("creator_handle")
                or data.get("creatorHandle")
                or data.get("creator")
                or None
            )


            print(
                "[TrustLens AI] JSON body received."
            )


        # =================================================
        # FORM DATA / MULTIPART REQUEST
        # =================================================

        elif (
            "multipart/form-data" in content_type
            or "application/x-www-form-urlencoded"
            in content_type
        ):

            try:

                form = await request.form()

                text = (
                    form.get("text")
                    or form.get("content")
                    or form.get("claim")
                    or ""
                )


                source_url = (
                    form.get("source_url")
                    or form.get("sourceUrl")
                    or form.get("url")
                    or None
                )


                creator_handle = (
                    form.get("creator_handle")
                    or form.get("creatorHandle")
                    or form.get("creator")
                    or None
                )


                # -------------------------------------------------
                # OPTIONAL IMAGE
                # -------------------------------------------------

                possible_image_fields = [
                    "image",
                    "evidence_image",
                    "file",
                    "image_file",
                ]


                for field_name in possible_image_fields:

                    uploaded = form.get(
                        field_name
                    )

                    if isinstance(
                        uploaded,
                        UploadFile
                    ):

                        try:

                            image_bytes = (
                                await uploaded.read()
                            )

                            print(
                                "[TrustLens AI] "
                                "Evidence image received:",
                                field_name
                            )

                        except Exception as exc:

                            print(
                                "[TrustLens AI] "
                                "Image read failed:",
                                type(exc).__name__,
                                str(exc)
                            )

                        break


                print(
                    "[TrustLens AI] Form data received."
                )


            except Exception as exc:

                print(
                    "[TrustLens AI] "
                    "Form parsing failed:",
                    type(exc).__name__,
                    str(exc)
                )


        # =================================================
        # QUERY PARAMETERS FALLBACK
        # =================================================

        else:

            query_params = request.query_params


            text = (
                query_params.get("text")
                or query_params.get("content")
                or ""
            )


            source_url = (
                query_params.get("source_url")
                or query_params.get("sourceUrl")
                or query_params.get("url")
                or None
            )


            creator_handle = (
                query_params.get("creator_handle")
                or query_params.get("creatorHandle")
                or query_params.get("creator")
                or None
            )


        # =================================================
        # CLEAN INPUT
        # =================================================

        if text is None:
            text = ""

        if source_url is not None:
            source_url = str(
                source_url
            ).strip()

            if not source_url:
                source_url = None


        if creator_handle is not None:
            creator_handle = str(
                creator_handle
            ).strip()

            if not creator_handle:
                creator_handle = None


        text = str(text).strip()


        # =================================================
        # DEBUG INFORMATION
        # =================================================

        print(
            "[TrustLens AI] Text received:",
            repr(text[:500])
        )

        print(
            "[TrustLens AI] Source URL received:",
            repr(source_url)
        )

        print(
            "[TrustLens AI] Creator received:",
            repr(creator_handle)
        )

        print(
            "[TrustLens AI] Image received:",
            bool(image_bytes)
        )


        # =================================================
        # VALIDATE INPUT
        # =================================================

        if (
            not text
            and not source_url
            and not image_bytes
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "No content was received. "
                    "Please provide text, a source URL, "
                    "or an evidence image."
                )
            )


        # =================================================
        # RUN TRUSTLENS ANALYSIS
        # =================================================

        result = run_content_analysis(
            content=text,
            source_url=source_url,
            creator_name=creator_handle,
            image_bytes=image_bytes,
        )


        # =================================================
        # NORMALIZE CLAIMS
        # =================================================

        normalized_claims = []


        for item in result.get(
            "claims",
            []
        ):

            if not isinstance(
                item,
                dict
            ):
                continue


            normalized_claims.append(
                {
                    "claim": (
                        item.get("claim")
                        or item.get("text")
                        or ""
                    ),

                    "claim_type": (
                        item.get("claim_type")
                        or item.get("type")
                        or "factual"
                    ),

                    "confidence": (
                        item.get("confidence")
                    ),

                    "status": (
                        item.get(
                            "status",
                            "Unverified"
                        )
                    ),

                    "explanation": (
                        item.get("explanation")
                        or item.get(
                            "verification_explanation"
                        )
                    ),

                    "evidence": (
                        item.get(
                            "evidence",
                            []
                        )
                    ),
                }
            )


        result["claims"] = normalized_claims


        # =================================================
        # SOURCES
        # =================================================

        result["sources"] = result.get(
            "evidence",
            []
        )


        # =================================================
        # SUMMARY
        # =================================================

        result["summary"] = (
            result.get(
                "explanation"
            )
            or "Analysis completed."
        )


        # =================================================
        # UNCERTAINTY
        # =================================================

        result["uncertainty"] = (
            "AI-based verification can contain errors. "
            "Verify important information against the "
            "original authoritative source."
        )


        # =================================================
        # DISCLOSURE
        # =================================================

        disclosure = result.get(
            "disclosure"
        )


        if isinstance(
            disclosure,
            dict
        ):

            result["disclosure"] = {

                "disclosed": disclosure.get(
                    "disclosed",
                    disclosure.get(
                        "detected",
                        False
                    )
                ),

                "disclosure_text": (
                    disclosure.get(
                        "disclosure_text"
                    )
                    or disclosure.get(
                        "trigger_text"
                    )
                ),

                "explanation": (
                    disclosure.get(
                        "explanation"
                    )
                ),
            }


        # =================================================
        # FINAL DEBUG
        # =================================================

        print(
            "[TrustLens AI] Analysis completed."
        )

        print(
            "[TrustLens AI] Claims:",
            len(
                result.get(
                    "claims",
                    []
                )
            )
        )

        print(
            "[TrustLens AI] Evidence:",
            len(
                result.get(
                    "evidence",
                    []
                )
            )
        )

        print(
            "[TrustLens AI] Overall status:",
            result.get(
                "overall_status"
            )
        )

        print(
            "[TrustLens AI] Risk:",
            result.get(
                "risk_level"
            )
        )

        print("=" * 70 + "\n")


        return result


    except HTTPException:
        raise


    except Exception as exc:

        import traceback

        print("\n" + "!" * 70)
        print(
            "[TrustLens AI] ANALYSIS FAILED"
        )
        print("!" * 70)

        print(
            "Exception type:",
            type(exc).__name__
        )

        print(
            "Exception:",
            str(exc)
        )

        traceback.print_exc()

        print("!" * 70 + "\n")


        raise HTTPException(
            status_code=500,
            detail=(
                f"{type(exc).__name__}: "
                f"{str(exc)}"
            )
        )