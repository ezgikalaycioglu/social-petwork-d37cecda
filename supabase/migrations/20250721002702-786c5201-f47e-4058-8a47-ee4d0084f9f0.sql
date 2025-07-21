-- Fix search path for update_contest_submission_vote_count function
CREATE OR REPLACE FUNCTION public.update_contest_submission_vote_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.pack_contest_submissions 
        SET vote_count = vote_count + 1 
        WHERE id = NEW.submission_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.pack_contest_submissions 
        SET vote_count = vote_count - 1 
        WHERE id = OLD.submission_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$