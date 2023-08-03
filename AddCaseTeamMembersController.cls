public with sharing class AddCaseTeamMembersController {
    @AuraEnabled(cacheable=true)
    public static List<CaseTeamRole> getCaseTeamRole()
    {
        List<CaseTeamRole> ltr=[SELECT Id, Name, CreatedById, AccessLevel FROM CaseTeamRole];
        system.debug(ltr);
        return ltr;
    }
    
    @AuraEnabled(Cacheable=false)
    public static string searchContactsByName(list<object> lstring) {
        system.debug('lstring'+lstring);
        
        list<CaseTeamMember> listCaseTeamMember=new list<CaseTeamMember>();
        String str = JSON.serialize(lstring);
        List<Object> arr =(List<Object>)JSON.deserializeUntyped(str);
        
        for(object o:arr)
        {
            CaseTeamMember cm =new CaseTeamMember();
            Map<String, Object> firstMap = (Map<String, Object>)o;
            cm.ParentId= (String)firstMap.get('parentId');
            cm.MemberId= (String)firstMap.get('memberId');
            cm.TeamRoleId = (String)firstMap.get('teamRoleId');
            listCaseTeamMember.add(cm);
        }
         Database.SaveResult[] saveResultList;
        try {
            if(listCaseTeamMember.size()>0)
            {  
                system.debug('listCaseTeamMember'+listCaseTeamMember);
                //insert listCaseTeamMember;
                saveResultList = Database.insert(listCaseTeamMember, true);
                for (Database.SaveResult sr : saveResultList) {
                    if (sr.isSuccess()) {
                        // Operation was successful, so get the ID of the record that was processed
                        System.debug('Successfully inserted CaseTeamMember. CaseTeamMember ID: ' + sr.getId());
                    }
                    else {
                        // Operation failed, so get all errors                
                        for(Database.Error err : sr.getErrors()) {
                            System.debug('The following error has occurred.');                    
                            System.debug(err.getStatusCode() + ': ' + err.getMessage());
                            System.debug('CaseTeamMember fields that affected this error: ' + err.getFields());
                        }
                    }
                }
            }
        } 
        catch(Exception  e) 
        {
            System.debug('The following exception has occurred: ' + e.getMessage()+saveResultList);
            throw new AuraHandledException(e.getMessage());
        }
        return 'Successfully Inserted';
    }
}
